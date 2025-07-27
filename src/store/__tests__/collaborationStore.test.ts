import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCollaborationStore } from '../collaborationStore'
import { mockCollaborationState, mockNoteBlocks } from '../../test/fixtures'
import { mockWebRTCConnection } from '../../test/utils'

// Mock the WebRTC service
const mockWebRTCService = {
  initialize: vi.fn().mockResolvedValue(undefined),
  createRoom: vi.fn().mockResolvedValue('room-123'),
  joinRoom: vi.fn().mockResolvedValue(undefined),
  leaveRoom: vi.fn().mockResolvedValue(undefined),
  sendMessage: vi.fn(),
  sendMessageToPeer: vi.fn(),
  onMessage: vi.fn(),
  onConnection: vi.fn(),
}

vi.mock('@/services/webrtc', () => ({
  WebRTCService: vi.fn(() => mockWebRTCService),
}))

describe('Collaboration Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset the store state
    useCollaborationStore.setState({
      isHost: false,
      roomId: '',
      peers: [],
      isConnected: false,
      sessionLink: undefined,
      webrtcService: null,
      error: null,
      onNotesUpdate: null,
    })
  })

  describe('Initialization', () => {
    it('should initialize collaboration successfully', async () => {
      const { initializeCollaboration } = useCollaborationStore.getState()

      await initializeCollaboration()

      const { webrtcService, error } = useCollaborationStore.getState()
      expect(webrtcService).toBeTruthy()
      expect(error).toBeNull()
      expect(mockWebRTCService.initialize).toHaveBeenCalled()
    })

    it('should handle initialization errors', async () => {
      mockWebRTCService.initialize.mockRejectedValueOnce(new Error('Init failed'))

      const { initializeCollaboration } = useCollaborationStore.getState()

      await expect(initializeCollaboration()).rejects.toThrow('Init failed')

      const { webrtcService, error } = useCollaborationStore.getState()
      expect(webrtcService).toBeNull()
      expect(error).toBe('Init failed')
    })

    it('should set up message handlers during initialization', async () => {
      const { initializeCollaboration } = useCollaborationStore.getState()

      await initializeCollaboration()

      expect(mockWebRTCService.onMessage).toHaveBeenCalledWith('notes-update', expect.any(Function))
      expect(mockWebRTCService.onMessage).toHaveBeenCalledWith('cursor-update', expect.any(Function))
      expect(mockWebRTCService.onMessage).toHaveBeenCalledWith('sync-request', expect.any(Function))
      expect(mockWebRTCService.onMessage).toHaveBeenCalledWith('sync-response', expect.any(Function))
    })

    it('should set up connection handlers during initialization', async () => {
      const { initializeCollaboration } = useCollaborationStore.getState()

      await initializeCollaboration()

      expect(mockWebRTCService.onConnection).toHaveBeenCalledWith('peer-connected', expect.any(Function))
      expect(mockWebRTCService.onConnection).toHaveBeenCalledWith('peer-disconnected', expect.any(Function))
    })
  })

  describe('Session Management', () => {
    beforeEach(async () => {
      useCollaborationStore.setState({ webrtcService: mockWebRTCService })
    })

    it('should create a session successfully', async () => {
      const { createSession } = useCollaborationStore.getState()

      const roomId = await createSession()

      expect(roomId).toBe('room-123')
      expect(mockWebRTCService.createRoom).toHaveBeenCalled()

      const { isHost, roomId: storeRoomId, sessionLink, isConnected, error } = useCollaborationStore.getState()
      expect(isHost).toBe(true)
      expect(storeRoomId).toBe('room-123')
      expect(sessionLink).toBeTruthy()
      expect(isConnected).toBe(true)
      expect(error).toBeNull()
    })

    it('should handle create session errors', async () => {
      mockWebRTCService.createRoom.mockRejectedValueOnce(new Error('Create failed'))

      const { createSession } = useCollaborationStore.getState()

      await expect(createSession()).rejects.toThrow('Create failed')

      const { error } = useCollaborationStore.getState()
      expect(error).toBe('Create failed')
    })

    it('should join a session successfully', async () => {
      const { joinSession } = useCollaborationStore.getState()

      await joinSession('room-123')

      expect(mockWebRTCService.joinRoom).toHaveBeenCalledWith('room-123')

      const { isHost, roomId, isConnected, error } = useCollaborationStore.getState()
      expect(isHost).toBe(false)
      expect(roomId).toBe('room-123')
      expect(isConnected).toBe(true)
      expect(error).toBeNull()
    })

    it('should handle join session errors', async () => {
      mockWebRTCService.joinRoom.mockRejectedValueOnce(new Error('Join failed'))

      const { joinSession } = useCollaborationStore.getState()

      await expect(joinSession('room-123')).rejects.toThrow('Join failed')

      const { error } = useCollaborationStore.getState()
      expect(error).toBe('Join failed')
    })

    it('should leave a session', async () => {
      useCollaborationStore.setState({
        isHost: true,
        roomId: 'room-123',
        peers: [{ id: 'peer-1', isConnected: true }],
        isConnected: true,
        sessionLink: 'http://example.com/session',
      })

      const { leaveSession } = useCollaborationStore.getState()

      await leaveSession()

      expect(mockWebRTCService.leaveRoom).toHaveBeenCalled()

      const { isHost, roomId, peers, isConnected, sessionLink, error } = useCollaborationStore.getState()
      expect(isHost).toBe(false)
      expect(roomId).toBe('')
      expect(peers).toEqual([])
      expect(isConnected).toBe(false)
      expect(sessionLink).toBeUndefined()
      expect(error).toBeNull()
    })

    it('should throw error when WebRTC service not initialized', async () => {
      useCollaborationStore.setState({ webrtcService: null })

      const { createSession, joinSession } = useCollaborationStore.getState()

      await expect(createSession()).rejects.toThrow('WebRTC service not initialized')
      await expect(joinSession('room-123')).rejects.toThrow('WebRTC service not initialized')
    })
  })

  describe('Session Link Management', () => {
    beforeEach(() => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000',
          pathname: '/meeting',
        },
        writable: true,
      })

      // Mock URL constructor for Node.js environment
      global.URL = class MockURL {
        searchParams: URLSearchParams
        
        constructor(url: string) {
          // Simple URL parsing for test
          const [, search] = url.split('?')
          this.searchParams = new URLSearchParams(search || '')
        }
      } as any
    })

    it('should generate session link', () => {
      const { generateSessionLink } = useCollaborationStore.getState()
      const link = generateSessionLink('room-123')

      expect(link).toContain('http://localhost:3000/meeting?session=')
      
      // Verify the encoded data can be decoded
      const url = new URL(link)
      const sessionParam = url.searchParams.get('session')
      expect(sessionParam).toBeTruthy()
      
      const decodedData = JSON.parse(atob(sessionParam!))
      expect(decodedData.roomId).toBe('room-123')
      expect(decodedData.timestamp).toBeTruthy()
    })

    it('should parse session link', () => {
      const sessionData = { roomId: 'room-123', timestamp: Date.now() }
      const encodedData = btoa(JSON.stringify(sessionData))
      const link = `http://localhost:3000/meeting?session=${encodedData}`

      const { parseSessionLink } = useCollaborationStore.getState()
      const roomId = parseSessionLink(link)

      expect(roomId).toBe('room-123')
    })

    it('should return null for invalid session link', () => {
      const { parseSessionLink } = useCollaborationStore.getState()
      
      expect(parseSessionLink('http://localhost:3000/meeting')).toBeNull()
      expect(parseSessionLink('http://localhost:3000/meeting?session=invalid')).toBeNull()
      expect(parseSessionLink('invalid-url')).toBeNull()
    })
  })

  describe('Peer Management', () => {
    it('should add a peer', () => {
      const { addPeer } = useCollaborationStore.getState()
      const peer = { id: 'peer-1', isConnected: true, name: 'John' }

      addPeer(peer)

      const { peers } = useCollaborationStore.getState()
      expect(peers).toContain(peer)
    })

    it('should replace existing peer when adding with same ID', () => {
      const peer1 = { id: 'peer-1', isConnected: true, name: 'John' }
      const peer2 = { id: 'peer-1', isConnected: true, name: 'Jane' }

      useCollaborationStore.setState({ peers: [peer1] })

      const { addPeer } = useCollaborationStore.getState()
      addPeer(peer2)

      const { peers } = useCollaborationStore.getState()
      expect(peers).toHaveLength(1)
      expect(peers[0].name).toBe('Jane')
    })

    it('should remove a peer', () => {
      const peer = { id: 'peer-1', isConnected: true }
      useCollaborationStore.setState({ peers: [peer] })

      const { removePeer } = useCollaborationStore.getState()
      removePeer('peer-1')

      const { peers } = useCollaborationStore.getState()
      expect(peers).toHaveLength(0)
    })

    it('should update peer cursor', () => {
      const peer = { id: 'peer-1', isConnected: true }
      useCollaborationStore.setState({ peers: [peer] })

      const { updatePeerCursor } = useCollaborationStore.getState()
      const cursor = { x: 100, y: 200 }
      updatePeerCursor('peer-1', cursor)

      const { peers } = useCollaborationStore.getState()
      expect(peers[0].cursor).toEqual(cursor)
    })
  })

  describe('Notes Synchronization', () => {
    beforeEach(() => {
      useCollaborationStore.setState({ webrtcService: mockWebRTCService })
    })

    it('should broadcast notes update', () => {
      const { broadcastNotesUpdate } = useCollaborationStore.getState()
      const blocks = mockNoteBlocks
      const operation = 'update'
      const blockId = 'block-1'

      broadcastNotesUpdate(blocks, operation, blockId)

      expect(mockWebRTCService.sendMessage).toHaveBeenCalledWith({
        type: 'notes-update',
        data: {
          blocks,
          operation,
          blockId,
        },
      })
    })

    it('should not broadcast when WebRTC service not available', () => {
      useCollaborationStore.setState({ webrtcService: null })

      const { broadcastNotesUpdate } = useCollaborationStore.getState()
      broadcastNotesUpdate(mockNoteBlocks, 'update')

      expect(mockWebRTCService.sendMessage).not.toHaveBeenCalled()
    })

    it('should handle notes update', () => {
      const mockHandler = vi.fn()
      useCollaborationStore.setState({ onNotesUpdate: mockHandler })

      const { handleNotesUpdate } = useCollaborationStore.getState()
      const message = {
        type: 'notes-update' as const,
        data: {
          blocks: mockNoteBlocks,
          operation: 'update' as const,
          blockId: 'block-1',
        },
      }

      handleNotesUpdate(message)

      expect(mockHandler).toHaveBeenCalledWith(mockNoteBlocks)
    })

    it('should not handle notes update without handler', () => {
      const { handleNotesUpdate } = useCollaborationStore.getState()
      const message = {
        type: 'notes-update' as const,
        data: {
          blocks: mockNoteBlocks,
          operation: 'update' as const,
        },
      }

      // Should not throw
      expect(() => handleNotesUpdate(message)).not.toThrow()
    })

    it('should request sync', () => {
      const { requestSync } = useCollaborationStore.getState()

      requestSync()

      expect(mockWebRTCService.sendMessage).toHaveBeenCalledWith({
        type: 'sync-request',
        data: {},
      })
    })

    it('should send sync response', () => {
      const { sendSyncResponse } = useCollaborationStore.getState()
      const peerId = 'peer-1'
      const notes = mockNoteBlocks

      sendSyncResponse(peerId, notes)

      expect(mockWebRTCService.sendMessageToPeer).toHaveBeenCalledWith(peerId, {
        type: 'sync-response',
        data: {
          notes,
        },
      })
    })

    it('should set notes update handler', () => {
      const mockHandler = vi.fn()

      const { setNotesUpdateHandler } = useCollaborationStore.getState()
      setNotesUpdateHandler(mockHandler)

      const { onNotesUpdate } = useCollaborationStore.getState()
      expect(onNotesUpdate).toBe(mockHandler)
    })
  })

  describe('Error Handling', () => {
    it('should handle generic errors during initialization', async () => {
      mockWebRTCService.initialize.mockRejectedValueOnce('Generic error')

      const { initializeCollaboration } = useCollaborationStore.getState()

      await expect(initializeCollaboration()).rejects.toBe('Generic error')

      const { error } = useCollaborationStore.getState()
      expect(error).toBe('Failed to initialize collaboration')
    })

    it('should handle generic errors during session creation', async () => {
      useCollaborationStore.setState({ webrtcService: mockWebRTCService })
      mockWebRTCService.createRoom.mockRejectedValueOnce('Generic error')

      const { createSession } = useCollaborationStore.getState()

      await expect(createSession()).rejects.toBe('Generic error')

      const { error } = useCollaborationStore.getState()
      expect(error).toBe('Failed to create session')
    })

    it('should handle generic errors during session join', async () => {
      useCollaborationStore.setState({ webrtcService: mockWebRTCService })
      mockWebRTCService.joinRoom.mockRejectedValueOnce('Generic error')

      const { joinSession } = useCollaborationStore.getState()

      await expect(joinSession('room-123')).rejects.toBe('Generic error')

      const { error } = useCollaborationStore.getState()
      expect(error).toBe('Failed to join session')
    })
  })
})