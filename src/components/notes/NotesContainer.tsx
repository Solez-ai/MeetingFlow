import { NotesEditor } from './NotesEditor'
import { NotesTaskIntegration } from './NotesTaskIntegration'
import { useMeetingStore } from '@/store/meetingStore'

export function NotesContainer() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-auto">
        <NotesEditor />
      </div>
      <div className="mt-4">
        <NotesTaskIntegration />
      </div>
    </div>
  )
}