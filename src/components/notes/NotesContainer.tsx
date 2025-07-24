import { NotesEditor } from './NotesEditor'
import { NotesTaskIntegration } from './NotesTaskIntegration'
import { PeerCursors } from '../collaboration'
import { useMeetingStore } from '@/store/meetingStore'

export function NotesContainer() {
  // const currentMeeting = useMeetingStore(state => state.currentMeeting)
  
  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-grow overflow-auto">
        <NotesEditor />
      </div>
      <div className="mt-4">
        <NotesTaskIntegration />
      </div>
      
      {/* Peer cursors overlay */}
      <PeerCursors />
    </div>
  )
}