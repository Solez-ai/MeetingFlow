/**
 * CollaborationHub - Main component for managing WebRTC collaboration sessions
 */

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Users, Share2, UserPlus, UserMinus, Wifi, WifiOff } from 'lucide-react'
import { useCollaborationStore } from '@/store/collaborationStore'
import { useMeetingStore } from '@/store/meetingStore'
import { generateSessionLink, extractRoomId } from '@/utils/sessionLink'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface CollaborationHubProps {
  isOpen: boolean
  onClose: () => void
}

export const CollaborationHub: React.FC<CollaborationHubProps> = ({ isOpen, onClose }) => {
  const [joinRoomId, setJoinRoomId] = useState('')
  const [showQRCode, setShowQRCode] = useState(false)
  const { toast } = useToast()
  
  const { currentMeeting } = useMeetingStore()
  const {
    isHost,
    roomId,
    peers,
    isConnected,
    error,
    initializeCollaboration,
    createSession,
    joinSession,
    leaveSession
  } = useCollaborationStore()

  // Generate session link when we have a room
  const sessionLink = roomId ? generateSessionLink(
    roomId, 
    currentMeeting?.id, 
    currentMeeting?.title
  ) : undefined

  useEffect(() => {
    // Initialize collaboration service when component mounts
    if (isOpen && !useCollaborationStore.getState().webrtcService) {
      initializeCollaboration().catch(console.error)
    }
  }, [isOpen, initializeCollaboration])

  useEffect(() => {
    // Check for session link in URL on mount
    const urlParams = new URLSearchParams(window.location.search)
    const sessionParam = urlParams.get('session')
    if (sessionParam) {
      const roomIdFromLink = extractRoomId(window.location.href)
      if (roomIdFromLink) {
        setJoinRoomId(roomIdFromLink)
      }
    }
  }, [])

  const handleCreateSession = async () => {
    try {
      await createSession()
      toast({
        title: "Session Created",
        description: "Your collaboration session is ready. Share the link with others to invite them.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create session",
        variant: "destructive"
      })
    }
  }

  const handleJoinSession = async () => {
    if (!joinRoomId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room ID or paste a session link",
        variant: "destructive"
      })
      return
    }

    try {
      // Extract room ID from input (handles both links and raw IDs)
      const roomIdToJoin = extractRoomId(joinRoomId)

      if (!roomIdToJoin) {
        throw new Error('Invalid session link or room ID')
      }

      await joinSession(roomIdToJoin)
      toast({
        title: "Joined Session",
        description: "Successfully joined the collaboration session",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join session",
        variant: "destructive"
      })
    }
  }

  const handleLeaveSession = async () => {
    try {
      await leaveSession()
      toast({
        title: "Left Session",
        description: "You have left the collaboration session",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave session",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const copyRoomId = () => copyToClipboard(roomId)
  const copySessionLink = () => sessionLink && copyToClipboard(sessionLink)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaboration Hub
              </CardTitle>
              <CardDescription>
                Share your meeting session and collaborate in real-time
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
                {isHost && <Badge variant="secondary">Host</Badge>}
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Not connected</span>
              </>
            )}
          </div>

          {!isConnected ? (
            /* Session Creation/Joining */
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Start Collaboration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleCreateSession} className="h-12">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create New Session
                  </Button>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter room ID or paste session link"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                    />
                    <Button onClick={handleJoinSession} variant="outline" className="w-full">
                      Join Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Session Management */
            <div className="space-y-6">
              {/* Session Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Active Session</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Room ID:</span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{roomId}</code>
                    <Button size="sm" variant="ghost" onClick={copyRoomId}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {sessionLink && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Share Link:</span>
                      <Button size="sm" variant="outline" onClick={copySessionLink}>
                        <Share2 className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setShowQRCode(!showQRCode)}
                      >
                        QR Code
                      </Button>
                    </div>
                  )}
                </div>

                {showQRCode && sessionLink && (
                  <div className="flex justify-center p-4 bg-white border rounded-lg">
                    <QRCodeSVG value={sessionLink} size={200} />
                  </div>
                )}
              </div>

              <Separator />

              {/* Connected Peers */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Connected Peers ({peers.length})
                </h4>
                
                {peers.length === 0 ? (
                  <p className="text-sm text-gray-500">No peers connected yet</p>
                ) : (
                  <div className="space-y-2">
                    {peers.map((peer) => (
                      <div key={peer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${peer.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm">{peer.name || `Peer ${peer.id.slice(0, 8)}`}</span>
                        </div>
                        <Badge variant={peer.isConnected ? "default" : "secondary"}>
                          {peer.isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Session Controls */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleLeaveSession}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Leave Session
                </Button>
                
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CollaborationHub