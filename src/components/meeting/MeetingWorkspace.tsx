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
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'

export function MeetingWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('agenda')
  const [isMobile, setIsMobile] = useState(false)
  const [showAgendaSidebar, setShowAgendaSidebar] = useState(true)
  const [agendaSidebarOpen, setAgendaSidebarOpen] = useState(false)
  
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const createMeeting = useMeetingStore(state => state.createMeeting)
  const loadMeeting = useMeetingStore(state => state.loadMeeting)
  
  // Enable keyboard shortcuts for voice commands
  useVoiceKeyboardShortcuts()
  
  // Detect mobile viewport and adjust layout
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setShowAgendaSidebar(false)
      } else {
        setShowAgendaSidebar(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
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
        {/* Header - Mobile optimized */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              {currentMeeting?.title || 'Loading...'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(currentMeeting?.startTime || Date.now()).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Agenda Sidebar Toggle */}
            {isMobile && activeTab === 'agenda' && (
              <Sheet open={agendaSidebarOpen} onOpenChange={setAgendaSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    Agenda
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="h-full p-4">
                    <AgendaSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            {/* Desktop Agenda Sidebar Toggle */}
            {!isMobile && activeTab === 'agenda' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgendaSidebar(!showAgendaSidebar)}
                className="gap-2"
              >
                {showAgendaSidebar ? (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    Hide Agenda
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Show Agenda
                  </>
                )}
              </Button>
            )}
            
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
          className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]"
        >
          {/* Mobile-optimized tab list */}
          <TabsList className="mb-3 sm:mb-4 w-full grid grid-cols-3">
            <TabsTrigger value="agenda" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Agenda & Notes</span>
              <span className="sm:hidden">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="transcription" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Transcription</span>
              <span className="sm:hidden">Audio</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agenda" className="h-full">
            {isMobile ? (
              // Mobile layout - stacked vertically
              <div className="flex flex-col gap-4 h-full">
                {/* Agenda Management Panel */}
                <div className="flex-1 min-h-0">
                  <AgendaManager />
                </div>
                
                {/* Notes Panel */}
                <div className="flex-1 min-h-0">
                  <NotesContainer />
                </div>
              </div>
            ) : (
              // Desktop layout - with optional sidebar
              <div className={`grid gap-6 h-full ${
                showAgendaSidebar 
                  ? 'grid-cols-12' 
                  : 'grid-cols-1'
              }`}>
                {/* Left Sidebar - Agenda Display (Desktop only) */}
                {showAgendaSidebar && (
                  <div className="col-span-3 h-full">
                    <AgendaSidebar />
                  </div>
                )}
                
                {/* Main Content Area */}
                <div className={`${
                  showAgendaSidebar ? 'col-span-9' : 'col-span-12'
                } grid grid-cols-1 lg:grid-cols-2 gap-6 h-full`}>
                  {/* Agenda Management Panel */}
                  <div className="lg:col-span-1 h-full">
                    <AgendaManager />
                  </div>
                  
                  {/* Notes Panel */}
                  <div className="lg:col-span-1 h-full">
                    <NotesContainer />
                  </div>
                </div>
              </div>
            )}
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