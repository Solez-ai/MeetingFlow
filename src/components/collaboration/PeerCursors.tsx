/**
 * PeerCursors - Display cursors of connected peers in the editor
 */

import React from 'react'
import { useCollaborationStore } from '@/store/collaborationStore'

interface PeerCursorProps {
  peerId: string
  x: number
  y: number
  name?: string
}

const PeerCursor: React.FC<PeerCursorProps> = ({ peerId, x, y, name }) => {
  // Generate a consistent color for each peer based on their ID
  const getColorForPeer = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500'
    ]
    
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) & 0xffffffff
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  const colorClass = getColorForPeer(peerId)
  const displayName = name || `User ${peerId.slice(0, 4)}`

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-100"
      style={{
        left: x,
        top: y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      {/* Cursor pointer */}
      <div className={`w-4 h-4 ${colorClass} transform rotate-45 rounded-sm`} />
      
      {/* User name label */}
      <div className={`${colorClass} text-white text-xs px-2 py-1 rounded-md mt-1 whitespace-nowrap`}>
        {displayName}
      </div>
    </div>
  )
}

export const PeerCursors: React.FC = () => {
  const { peers, isConnected } = useCollaborationStore()

  if (!isConnected) return null

  return (
    <>
      {peers
        .filter(peer => peer.cursor && peer.isConnected)
        .map(peer => (
          <PeerCursor
            key={peer.id}
            peerId={peer.id}
            x={peer.cursor!.x}
            y={peer.cursor!.y}
            name={peer.name}
          />
        ))}
    </>
  )
}

export default PeerCursors