import { NotesEditor } from './NotesEditor'
import { useMeetingStore } from '@/store/meetingStore'

export function NotesContainer() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  
  return (
    <div className="h-full">
      <NotesEditor />
    </div>
  )
}