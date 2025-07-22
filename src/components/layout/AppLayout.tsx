import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { MicIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useState } from 'react'

export function AppLayout() {
  const [showVoiceCommands, setShowVoiceCommands] = useState(false)
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 max-w-7xl h-full">
          <div className="h-full min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Voice Command Button - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          size="icon" 
          className={`h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
            showVoiceCommands 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          }`}
          onClick={() => setShowVoiceCommands(!showVoiceCommands)}
        >
          <MicIcon className="h-5 w-5 text-white" />
          <span className="sr-only">
            {showVoiceCommands ? 'Stop listening' : 'Start voice commands'}
          </span>
        </Button>
        
        {/* Voice Command Indicator */}
        {showVoiceCommands && (
          <div className="absolute -top-10 right-0 bg-background border border-border rounded-lg px-3 py-1.5 shadow-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm font-medium">Mic's on. Say something smart.</p>
          </div>
        )}
      </div>
      
      <footer className="py-4 border-t border-border bg-muted/20 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <span className="hidden sm:inline">MeetingFlow &copy; {new Date().getFullYear()} - Privacy-First Meeting Productivity Tool</span>
          <span className="sm:hidden">MeetingFlow &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}