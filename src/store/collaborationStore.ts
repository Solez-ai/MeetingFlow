/**
 * Collaboration Store for WebRTC peer-to-peer collaboration
 */

import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { WebRTCService } from '@/services/webrtc'
import { 
  Peer, 
  CollaborationState, 
  CollaborationMessage,
  NotesUpdateMessage,
  CursorUpdateMessage,
  SyncMessage
} from '@/types/collaboration'
import { NoteBlock } from '@/types'

interface CollaborationStore extends CollaborationState {
  // Additional state
  webrtcService: WebRTCService | null
  error: string | null
  
  // Actions
  initializeCollaboration: () => Promise<void>
  createSession: () => Promise<string>
  joinSession: (roomId: string) => Promise<void>
  leaveSession: () => Promise<void>
  generateSessionLink: (roomId: string) => string
  parseSessionLink: (link: string) => string | null
  
  // Peer management
  addPeer: (peer: Peer) => void
  removePeer: (peerId: string) => void
  updatePeerCursor: (peerId: string, cursor: { x: number; y: number }) => void
  
  // Notes synchronization
  broadcastNotesUpdate: (blocks: NoteBlock[], operation: 'insert' | 'update' | 'delete', blockId?: string) => void
  handleNotesUpdate: (message: NotesUpdateMessage) => void
  requestSync: () => void
  sendSyncResponse: (peerId: string, notes: NoteBlock[]) => void
  
  // Event handlers
  onNotesUpdate: ((blocks: NoteBlock[]) => void) | null
  setNotesUpdateHandler: (handler: (blocks: NoteBlock[]) => void) => void
}

export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
  isHost: false,
  roomId: '',
  peers: [],
  isConnected: false,
  sessionLink: undefined,
  webrtcService: null,
  error: null,
  onNotesUpdate: null,

  initializeCollaboration: async () => {
    try {
      const peerId = uuidv4()
      const webrtcService = new WebRTCService(peerId)
      
      await webrtcService.initialize()
      
      // Set up message handlers
      webrtcService.onMessage('notes-update', (message: CollaborationMessage) => {
        get().handleNotesUpdate(message as NotesUpdateMessage)
      })
      
      webrtcService.onMessage('cursor-update', (message: CollaborationMessage, peerId: string) => {
        const cursorMessage = message as CursorUpdateMessage
        get().updatePeerCursor(peerId, cursorMessage.data)
      })
      
      webrtcService.onMessage('sync-request', () => {
        // Handle sync request - would need to get current notes from meeting store
        // This would be implemented when integrating with the notes editor
      })
      
      webrtcService.onMessage('sync-response', (message: CollaborationMessage) => {
        const syncMessage = message as SyncMessage
        const handler = get().onNotesUpdate
        if (handler && syncMessage.data.notes) {
          handler(syncMessage.data.notes)
        }
      })
      
      // Set up connection handlers
      webrtcService.onConnection('peer-connected', (peerId: string) => {
        get().addPeer({
          id: peerId,
          isConnected: true
        })
      })
      
      webrtcService.onConnection('peer-disconnected', (peerId: string) => {
        get().removePeer(peerId)
      })
      
      set({ 
        webrtcService,
        error: null
      })
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize collaboration',
        webrtcService: null
      })
      throw error
    }
  },

  createSession: async () => {
    const { webrtcService } = get()
    if (!webrtcService) {
      throw new Error('WebRTC service not initialized')
    }

    try {
      const roomId = await webrtcService.createRoom()
      const sessionLink = get().generateSessionLink(roomId)
      
      set({
        isHost: true,
        roomId,
        sessionLink,
        isConnected: true,
        error: null
      })
      
      return roomId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
      set({ error: errorMessage })
      throw error
    }
  },

  joinSession: async (roomId: string) => {
    const { webrtcService } = get()
    if (!webrtcService) {
      throw new Error('WebRTC service not initialized')
    }

    try {
      await webrtcService.joinRoom(roomId)
      
      set({
        isHost: false,
        roomId,
        isConnected: true,
        error: null
      })
      
      // Request sync from existing peers
      get().requestSync()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join session'
      set({ error: errorMessage })
      throw error
    }
  },

  leaveSession: async () => {
    const { webrtcService } = get()
    if (webrtcService) {
      await webrtcService.leaveRoom()
    }

    set({
      isHost: false,
      roomId: '',
      peers: [],
      isConnected: false,
      sessionLink: undefined,
      error: null
    })
  },

  generateSessionLink: (roomId: string) => {
    const baseUrl = window.location.origin + window.location.pathname
    const sessionData = {
      roomId,
      timestamp: Date.now()
    }
    const encodedData = btoa(JSON.stringify(sessionData))
    return `${baseUrl}?session=${encodedData}`
  },

  parseSessionLink: (link: string) => {
    try {
      const url = new URL(link)
      const sessionParam = url.searchParams.get('session')
      if (!sessionParam) return null
      
      const sessionData = JSON.parse(atob(sessionParam))
      return sessionData.roomId || null
    } catch (error) {
      console.error('Failed to parse session link:', error)
      return null
    }
  },

  addPeer: (peer: Peer) => {
    set(state => ({
      peers: [...state.peers.filter(p => p.id !== peer.id), peer]
    }))
  },

  removePeer: (peerId: string) => {
    set(state => ({
      peers: state.peers.filter(p => p.id !== peerId)
    }))
  },

  updatePeerCursor: (peerId: string, cursor: { x: number; y: number }) => {
    set(state => ({
      peers: state.peers.map(peer => 
        peer.id === peerId ? { ...peer, cursor } : peer
      )
    }))
  },

  broadcastNotesUpdate: (blocks: NoteBlock[], operation: 'insert' | 'update' | 'delete', blockId?: string) => {
    const { webrtcService } = get()
    if (!webrtcService) return

    webrtcService.sendMessage({
      type: 'notes-update',
      data: {
        blocks,
        operation,
        blockId
      }
    })
  },

  handleNotesUpdate: (message: NotesUpdateMessage) => {
    const handler = get().onNotesUpdate
    if (handler) {
      // Apply last-write-wins strategy based on timestamp
      handler(message.data.blocks)
    }
  },

  requestSync: () => {
    const { webrtcService } = get()
    if (!webrtcService) return

    webrtcService.sendMessage({
      type: 'sync-request',
      data: {}
    })
  },

  sendSyncResponse: (peerId: string, notes: NoteBlock[]) => {
    const { webrtcService } = get()
    if (!webrtcService) return

    webrtcService.sendMessageToPeer(peerId, {
      type: 'sync-response',
      data: {
        notes
      }
    })
  },

  setNotesUpdateHandler: (handler: (blocks: NoteBlock[]) => void) => {
    set({ onNotesUpdate: handler })
  }
}))