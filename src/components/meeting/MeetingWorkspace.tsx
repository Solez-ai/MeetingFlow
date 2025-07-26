import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AgendaManager } from '../agenda/AgendaManager'
import { AgendaSidebar } from '../agenda/AgendaSidebar'
import { NotesContainer } from '../notes/NotesContainer'
import { TaskManager } from '../tasks/TaskManager'
import { TranscriptionPage } from '../transcription/TranscriptionPage'
import { VoiceCommandButton } from '../voice/VoiceCommandButton'
import { CollaborationProvider, CollaborationButton } from '../collaboration'
import { ExportDialog } from '../export'
import { useVoiceKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useMeetingStore } from '@/store/meetingStore'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

export function MeetingWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('agenda')
  
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const createMeeting = useMeetingStore(state => state.createMeeting)
  const loadMeeting = useMeetingStore(state => state.loadMeeting)
  
  // Enable keyboard shortcuts for voice commands
  useVoiceKeyboardShortcuts()
  
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
    <CollaborationProvider>
      <div className="h-full">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              {currentMeeting?.title || 'Loading...'}
            </h1>
            <p className="text-muted-foreground">
              {new Date(currentMeeting?.startTime || Date.now()).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Export Button */}
            {currentMeeting && <ExportDialog meeting={currentMeeting} />}
            
            {/* Collaboration Button */}
            <CollaborationButton />
          </div>
        </div>
        
        {/* Floating Voice Command Button */}
        <VoiceCommandButton variant="floating" />
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="h-[calc(100vh-200px)]"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="agenda">Agenda & Notes</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agenda" className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left Sidebar - Agenda Display */}
            <div className="lg:col-span-3 h-full">
              <AgendaSidebar />
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Agenda Management Panel */}
              <div className="lg:col-span-1 h-full agenda-panel">
                <AgendaManager />
              </div>
              
              {/* Notes Panel */}
              <div className="lg:col-span-1 h-full">
                <NotesContainer />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="h-full">
          <div className="h-full overflow-hidden">
            <TaskManager />
          </div>
        </TabsContent>
        
        <TabsContent value="transcription" className="h-full">
          <div className="h-full overflow-hidden">
            <TranscriptionPage />
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </CollaborationProvider>
  )
}