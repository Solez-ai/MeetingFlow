/**
 * CollaborationProvider - Integrates WebRTC collaboration with the notes editor
 */

import React, { useEffect, useCallback } from 'react'
import { useCollaborationStore } from '@/store/collaborationStore'
import { useMeetingStore } from '@/store/meetingStore'
import { NoteBlock } from '@/types'

interface CollaborationProviderProps {
  children: React.ReactNode
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const { currentMeeting, updateMeeting, currentMeetingId } = useMeetingStore()
  const { 
    isConnected, 
    broadcastNotesUpdate, 
    setNotesUpdateHandler,
    sendSyncResponse
  } = useCollaborationStore()

  // Handle incoming notes updates from peers
  const handleNotesUpdate = useCallback((blocks: NoteBlock[]) => {
    if (currentMeetingId && blocks) {
      // Apply the update using last-write-wins strategy
      updateMeeting(currentMeetingId, { notes: blocks })
    }
  }, [currentMeetingId, updateMeeting])

  // Set up the notes update handler
  useEffect(() => {
    setNotesUpdateHandler(handleNotesUpdate)
  }, [handleNotesUpdate, setNotesUpdateHandler])

  // Broadcast notes changes to peers when local notes change
  useEffect(() => {
    if (isConnected && currentMeeting?.notes) {
      // Only broadcast if we have peers connected
      const { peers } = useCollaborationStore.getState()
      if (peers.length > 0) {
        broadcastNotesUpdate(currentMeeting.notes, 'update')
      }
    }
  }, [currentMeeting?.notes, isConnected, broadcastNotesUpdate])

  // Handle sync requests from new peers
  useEffect(() => {
    const { webrtcService } = useCollaborationStore.getState()
    if (webrtcService && currentMeeting) {
      webrtcService.onMessage('sync-request', (_message, _peerId) => {
        // Send current notes to the requesting peer
        if (currentMeeting.notes) {
          sendSyncResponse(_peerId, currentMeeting.notes)
        }
      })
    }
  }, [currentMeeting, sendSyncResponse])

  return <>{children}</>
}

export default CollaborationProvider