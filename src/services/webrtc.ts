/**
 * WebRTC Service for peer-to-peer collaboration
 */

import SimplePeer from 'simple-peer'
import { v4 as uuidv4 } from 'uuid'
import { SignalingService } from './signaling'
import { 
  Peer, 
  CollaborationMessage, 
  SignalingMessage, 
  WebRTCConfig 
} from '@/types/collaboration'

export class WebRTCService {
  private peers: Map<string, SimplePeer.Instance> = new Map()
  private signalingService: SignalingService
  private messageHandlers: Map<string, (message: CollaborationMessage, peerId: string) => void> = new Map()
  private connectionHandlers: Map<string, (peerId: string) => void> = new Map()
  private isHost = false
  private roomId: string | null = null

  private config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    channelConfig: {
      ordered: true
    }
  }

  constructor(private peerId: string = uuidv4()) {
    this.signalingService = new SignalingService(this.peerId)
    this.setupSignalingHandlers()
  }

  async initialize(): Promise<void> {
    await this.signalingService.connect()
  }

  async createRoom(): Promise<string> {
    this.roomId = uuidv4()
    this.isHost = true
    await this.signalingService.joinRoom(this.roomId)
    return this.roomId
  }

  async joinRoom(roomId: string): Promise<void> {
    this.roomId = roomId
    this.isHost = false
    await this.signalingService.joinRoom(roomId)
  }

  async leaveRoom(): Promise<void> {
    if (this.roomId) {
      await this.signalingService.leaveRoom(this.roomId)
      this.disconnectAllPeers()
      this.roomId = null
      this.isHost = false
    }
  }

  onMessage(type: string, handler: (message: CollaborationMessage, peerId: string) => void): void {
    this.messageHandlers.set(type, handler)
  }

  onConnection(event: string, handler: (peerId: string) => void): void {
    this.connectionHandlers.set(event, handler)
  }

  async sendMessage(message: Omit<CollaborationMessage, 'senderId' | 'timestamp'>): Promise<void> {
    const fullMessage: CollaborationMessage = {
      ...message,
      senderId: this.peerId,
      timestamp: Date.now()
    }

    const messageStr = JSON.stringify(fullMessage)
    
    this.peers.forEach((peer, peerId) => {
      if (peer.connected) {
        try {
          peer.send(messageStr)
        } catch (error) {
          console.error(`Failed to send message to peer ${peerId}:`, error)
        }
      }
    })
  }

  async sendMessageToPeer(peerId: string, message: Omit<CollaborationMessage, 'senderId' | 'timestamp'>): Promise<void> {
    const peer = this.peers.get(peerId)
    if (peer && peer.connected) {
      const fullMessage: CollaborationMessage = {
        ...message,
        senderId: this.peerId,
        timestamp: Date.now()
      }

      try {
        peer.send(JSON.stringify(fullMessage))
      } catch (error) {
        console.error(`Failed to send message to peer ${peerId}:`, error)
      }
    }
  }

  getConnectedPeers(): Peer[] {
    return Array.from(this.peers.entries())
      .filter(([_, peer]) => peer.connected)
      .map(([id, peer]) => ({
        id,
        isConnected: peer.connected,
        connection: peer
      }))
  }

  getRoomId(): string | null {
    return this.roomId
  }

  isRoomHost(): boolean {
    return this.isHost
  }

  getPeerId(): string {
    return this.peerId
  }

  private setupSignalingHandlers(): void {
    this.signalingService.onMessage('peer-joined', (message: SignalingMessage) => {
      if (message.data.peerId !== this.peerId) {
        this.createPeerConnection(message.data.peerId, true)
      }
    })

    this.signalingService.onMessage('peer-left', (message: SignalingMessage) => {
      this.removePeer(message.data.peerId)
    })

    this.signalingService.onMessage('offer', (message: SignalingMessage) => {
      this.handleOffer(message)
    })

    this.signalingService.onMessage('answer', (message: SignalingMessage) => {
      this.handleAnswer(message)
    })

    this.signalingService.onMessage('ice-candidate', (message: SignalingMessage) => {
      this.handleIceCandidate(message)
    })
  }

  private createPeerConnection(peerId: string, initiator: boolean): void {
    if (this.peers.has(peerId)) {
      return // Connection already exists
    }

    const peer = new (SimplePeer as any)({
      initiator,
      config: {
        iceServers: this.config.iceServers
      },
      channelConfig: this.config.channelConfig
    })

    this.peers.set(peerId, peer)

    peer.on('signal', (data) => {
      const messageType = data.type === 'offer' ? 'offer' : 
                         data.type === 'answer' ? 'answer' : 'ice-candidate'
      
      this.signalingService.sendMessage({
        type: messageType,
        data,
        roomId: this.roomId!,
        peerId: this.peerId,
        targetPeerId: peerId
      })
    })

    peer.on('connect', () => {
      console.log(`Connected to peer ${peerId}`)
      const handler = this.connectionHandlers.get('peer-connected')
      if (handler) {
        handler(peerId)
      }
    })

    peer.on('data', (data) => {
      try {
        const message: CollaborationMessage = JSON.parse(data.toString())
        const handler = this.messageHandlers.get(message.type)
        if (handler) {
          handler(message, peerId)
        }
      } catch (error) {
        console.error('Failed to parse peer message:', error)
      }
    })

    peer.on('close', () => {
      console.log(`Peer ${peerId} disconnected`)
      this.removePeer(peerId)
    })

    peer.on('error', (error) => {
      console.error(`Peer ${peerId} error:`, error)
      this.removePeer(peerId)
    })
  }

  private handleOffer(message: SignalingMessage): void {
    if (!this.peers.has(message.peerId)) {
      this.createPeerConnection(message.peerId, false)
    }
    
    const peer = this.peers.get(message.peerId)
    if (peer) {
      peer.signal(message.data)
    }
  }

  private handleAnswer(message: SignalingMessage): void {
    const peer = this.peers.get(message.peerId)
    if (peer) {
      peer.signal(message.data)
    }
  }

  private handleIceCandidate(message: SignalingMessage): void {
    const peer = this.peers.get(message.peerId)
    if (peer) {
      peer.signal(message.data)
    }
  }

  private removePeer(peerId: string): void {
    const peer = this.peers.get(peerId)
    if (peer) {
      peer.destroy()
      this.peers.delete(peerId)
      
      const handler = this.connectionHandlers.get('peer-disconnected')
      if (handler) {
        handler(peerId)
      }
    }
  }

  private disconnectAllPeers(): void {
    this.peers.forEach((peer, peerId) => {
      peer.destroy()
    })
    this.peers.clear()
  }

  destroy(): void {
    this.disconnectAllPeers()
    this.signalingService.disconnect()
    this.messageHandlers.clear()
    this.connectionHandlers.clear()
  }
}