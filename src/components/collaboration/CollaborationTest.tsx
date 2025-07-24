/**
 * Simple test component to verify collaboration features work
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const CollaborationTest = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [peers, setPeers] = useState<string[]>([])

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9)
    setRoomId(newRoomId)
    setIsConnected(true)
  }

  const handleJoinRoom = () => {
    setIsConnected(true)
    setPeers(['peer-1', 'peer-2'])
  }

  const handleLeaveRoom = () => {
    setIsConnected(false)
    setRoomId('')
    setPeers([])
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Collaboration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Status:</span>
          <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {roomId && (
          <div className="text-sm">
            <span className="font-medium">Room ID:</span> {roomId}
          </div>
        )}

        {peers.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Peers:</span> {peers.length}
          </div>
        )}

        <div className="flex gap-2">
          {!isConnected ? (
            <>
              <Button onClick={handleCreateRoom} size="sm">
                Create Room
              </Button>
              <Button onClick={handleJoinRoom} variant="outline" size="sm">
                Join Room
              </Button>
            </>
          ) : (
            <Button onClick={handleLeaveRoom} variant="outline" size="sm">
              Leave Room
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CollaborationTest