import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AgendaManager } from '../agenda/AgendaManager'
import { AgendaSidebar } from '../agenda/AgendaSidebar'
import { useMeetingStore } from '@/store/meetingStore'

export function MeetingWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const createMeeting = useMeetingStore(state => state.createMeeting)
  const loadMeeting = useMeetingStore(state => state.loadMeeting)
  
  // Load or create meeting on component mount
  useEffect(() => {
    if (id) {
      // Load existing meeting
      const meeting = loadMeeting(id)
      if (!meeting) {
        // Meeting not found, redirect to dashboard
        navigate('/')
      }
    } else if (!currentMeeting) {
      // Create new meeting if none exists
      createMeeting('New Meeting')
    }
  }, [id, currentMeeting, createMeeting, loadMeeting, navigate])
  
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {currentMeeting?.title || 'Loading...'}
        </h1>
        <p className="text-muted-foreground">
          {new Date(currentMeeting?.startTime || Date.now()).toLocaleString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar - Agenda Display */}
        <div className="lg:col-span-3 h-full">
          <AgendaSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Agenda Management Panel */}
          <div className="lg:col-span-1 h-full agenda-panel">
            <AgendaManager />
          </div>
          
          {/* Notes Panel */}
          <Card className="lg:col-span-1 h-full">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Rich text editor coming soon...</p>
            </CardContent>
          </Card>
          
          {/* Tasks Panel */}
          <Card className="lg:col-span-1 h-full">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Task management coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}