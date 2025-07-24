/**
 * WebRTC Collaboration Types
 */

import { NoteBlock } from './index'

export interface Peer {
  id: string
  name?: string
  cursor?: { x: number; y: number }
  isConnected: boolean
  connection?: any // SimplePeer instance
}

export interface CollaborationState {
  isHost: boolean
  roomId: string
  peers: Peer[]
  isConnected: boolean
  sessionLink?: string
}

export interface CollaborationMessage {
  type: 'notes-update' | 'cursor-update' | 'peer-join' | 'peer-leave' | 'sync-request' | 'sync-response'
  data: any
  senderId: string
  timestamp: number
}

export interface NotesUpdateMessage {
  type: 'notes-update'
  data: {
    blocks: NoteBlock[]
    operation: 'insert' | 'update' | 'delete'
    blockId?: string
  }
  senderId: string
  timestamp: number
}

export interface CursorUpdateMessage {
  type: 'cursor-update'
  data: {
    x: number
    y: number
    blockId?: string
  }
  senderId: string
  timestamp: number
}

export interface SyncMessage {
  type: 'sync-request' | 'sync-response'
  data: {
    notes: NoteBlock[]
    agenda?: any[]
    tasks?: any[]
  }
  senderId: string
  timestamp: number
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'peer-joined' | 'peer-left'
  data: any
  roomId: string
  peerId: string
  targetPeerId?: string
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  channelConfig: {
    ordered: boolean
    maxRetransmits?: number
  }
}