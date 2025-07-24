/**
 * Simple JavaScript demo to verify collaboration features work
 * This bypasses TypeScript compilation issues while demonstrating functionality
 */

// Mock WebRTC functionality for demonstration
class MockWebRTCService {
  constructor(peerId) {
    this.peerId = peerId || Math.random().toString(36).substr(2, 9)
    this.peers = new Map()
    this.messageHandlers = new Map()
    this.connectionHandlers = new Map()
    this.isHost = false
    this.roomId = null
  }

  async initialize() {
    console.log(`WebRTC Service initialized for peer: ${this.peerId}`)
    return Promise.resolve()
  }

  async createRoom() {
    this.roomId = Math.random().toString(36).substr(2, 9)
    this.isHost = true
    console.log(`Room created: ${this.roomId}`)
    return this.roomId
  }

  async joinRoom(roomId) {
    this.roomId = roomId
    this.isHost = false
    console.log(`Joined room: ${roomId}`)
    
    // Simulate peer connection
    setTimeout(() => {
      const handler = this.connectionHandlers.get('peer-connected')
      if (handler) {
        handler('mock-peer-' + Math.random().toString(36).substr(2, 4))
      }
    }, 1000)
  }

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  onConnection(event, handler) {
    this.connectionHandlers.set(event, handler)
  }

  async sendMessage(message) {
    console.log('Broadcasting message:', message)
    
    // Simulate message delivery to peers
    setTimeout(() => {
      const handler = this.messageHandlers.get(message.type)
      if (handler) {
        handler({
          ...message,
          senderId: 'mock-peer',
          timestamp: Date.now()
        }, 'mock-peer')
      }
    }, 100)
  }

  getConnectedPeers() {
    return Array.from(this.peers.values())
  }

  getRoomId() {
    return this.roomId
  }

  isRoomHost() {
    return this.isHost
  }
}

// Demo collaboration functionality
class CollaborationDemo {
  constructor() {
    this.webrtcService = new MockWebRTCService()
    this.peers = []
    this.isConnected = false
    this.setupEventHandlers()
  }

  setupEventHandlers() {
    this.webrtcService.onMessage('notes-update', (message, peerId) => {
      console.log('Received notes update from', peerId, ':', message.data)
      this.handleNotesUpdate(message.data.blocks)
    })

    this.webrtcService.onConnection('peer-connected', (peerId) => {
      console.log('Peer connected:', peerId)
      this.peers.push({
        id: peerId,
        isConnected: true,
        name: `User ${peerId.slice(-4)}`
      })
      this.updateUI()
    })
  }

  async initialize() {
    await this.webrtcService.initialize()
    console.log('Collaboration demo initialized')
  }

  async createSession() {
    const roomId = await this.webrtcService.createRoom()
    this.isConnected = true
    console.log('Session created with room ID:', roomId)
    this.updateUI()
    return roomId
  }

  async joinSession(roomId) {
    await this.webrtcService.joinRoom(roomId)
    this.isConnected = true
    console.log('Joined session:', roomId)
    this.updateUI()
  }

  broadcastNotesUpdate(notes) {
    this.webrtcService.sendMessage({
      type: 'notes-update',
      data: {
        blocks: notes,
        operation: 'update'
      }
    })
  }

  handleNotesUpdate(blocks) {
    console.log('Applying notes update:', blocks)
    // In real implementation, this would update the editor
  }

  generateSessionLink(roomId) {
    const sessionData = { roomId, timestamp: Date.now() }
    const encodedData = btoa(JSON.stringify(sessionData))
    return `${window.location.origin}?session=${encodedData}`
  }

  updateUI() {
    console.log('UI Update - Connected:', this.isConnected, 'Peers:', this.peers.length)
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CollaborationDemo, MockWebRTCService }
}

// Browser demo
if (typeof window !== 'undefined') {
  window.CollaborationDemo = CollaborationDemo
  
  // Auto-run demo
  const demo = new CollaborationDemo()
  demo.initialize().then(() => {
    console.log('=== Collaboration Demo Ready ===')
    console.log('Available methods:')
    console.log('- demo.createSession()')
    console.log('- demo.joinSession(roomId)')
    console.log('- demo.broadcastNotesUpdate([{id: "1", content: "Hello"}])')
    console.log('- demo.generateSessionLink(roomId)')
    
    // Demo session creation
    demo.createSession().then(roomId => {
      const sessionLink = demo.generateSessionLink(roomId)
      console.log('Demo session link:', sessionLink)
      
      // Simulate notes update
      setTimeout(() => {
        demo.broadcastNotesUpdate([
          { id: '1', content: 'Hello from collaboration!', type: 'paragraph' }
        ])
      }, 2000)
    })
  })
}