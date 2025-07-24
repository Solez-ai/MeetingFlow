/**
 * Lightweight WebSocket signaling server for WebRTC peer discovery
 * This would typically be a separate server, but for demo purposes,
 * we'll use a simple in-memory signaling mechanism
 */

import { SignalingMessage } from '@/types/collaboration'

export class SignalingService {
  private ws: WebSocket | null = null
  private messageHandlers: Map<string, (message: SignalingMessage) => void> = new Map()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  // For demo purposes, we'll use a simple in-memory store
  // In production, this would be handled by a WebSocket server
  private static rooms: Map<string, Set<string>> = new Map()
  private static messageQueue: Map<string, SignalingMessage[]> = new Map()

  constructor(private peerId: string) {}

  async connect(): Promise<void> {
    // For demo purposes, we'll simulate a WebSocket connection
    // In production, you would connect to a real signaling server
    return new Promise((resolve) => {
      this.isConnected = true
      this.reconnectAttempts = 0
      resolve()
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.messageHandlers.clear()
  }

  onMessage(type: string, handler: (message: SignalingMessage) => void): void {
    this.messageHandlers.set(type, handler)
  }

  async sendMessage(message: SignalingMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Signaling service not connected')
    }

    // Simulate message routing for demo purposes
    // In production, this would be sent via WebSocket to the signaling server
    this.routeMessage(message)
  }

  private routeMessage(message: SignalingMessage): void {
    const { roomId, targetPeerId } = message

    // Handle room management
    if (message.type === 'join-room') {
      if (!SignalingService.rooms.has(roomId)) {
        SignalingService.rooms.set(roomId, new Set())
      }
      SignalingService.rooms.get(roomId)!.add(message.peerId)

      // Notify existing peers about new peer
      const existingPeers = Array.from(SignalingService.rooms.get(roomId)!)
        .filter(id => id !== message.peerId)

      existingPeers.forEach(peerId => {
        this.deliverMessage({
          type: 'peer-joined',
          data: { peerId: message.peerId },
          roomId,
          peerId: message.peerId,
          targetPeerId: peerId
        })
      })

      return
    }

    // Handle targeted messages (offer, answer, ice-candidate)
    if (targetPeerId) {
      this.deliverMessage(message)
      return
    }

    // Handle broadcast messages
    const roomPeers = SignalingService.rooms.get(roomId)
    if (roomPeers) {
      roomPeers.forEach(peerId => {
        if (peerId !== message.peerId) {
          this.deliverMessage({
            ...message,
            targetPeerId: peerId
          })
        }
      })
    }
  }

  private deliverMessage(message: SignalingMessage): void {
    // In a real implementation, this would be sent via WebSocket
    // For demo purposes, we'll use setTimeout to simulate async delivery
    setTimeout(() => {
      const handler = this.messageHandlers.get(message.type)
      if (handler) {
        handler(message)
      }
    }, 10)
  }

  async joinRoom(roomId: string): Promise<void> {
    await this.sendMessage({
      type: 'join-room',
      data: {},
      roomId,
      peerId: this.peerId
    })
  }

  async leaveRoom(roomId: string): Promise<void> {
    const room = SignalingService.rooms.get(roomId)
    if (room) {
      room.delete(this.peerId)
      if (room.size === 0) {
        SignalingService.rooms.delete(roomId)
      }
    }

    await this.sendMessage({
      type: 'peer-left',
      data: {},
      roomId,
      peerId: this.peerId
    })
  }
}