import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { MicIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useState, useEffect } from 'react'

export function AppLayout() {
  const [showVoiceCommands, setShowVoiceCommands] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl h-full">
          <div className="h-full min-h-[calc(100vh-7rem)] sm:min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Voice Command Button - Fixed Position with mobile optimization */}
      <div className={`fixed z-40 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}>
        <Button 
          size="icon" 
          className={`${isMobile ? 'h-14 w-14' : 'h-12 w-12'} rounded-full shadow-lg transition-all duration-300 touch-manipulation ${
            showVoiceCommands 
              ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:from-indigo-700 active:to-purple-800'
          }`}
          onClick={() => setShowVoiceCommands(!showVoiceCommands)}
        >
          <MicIcon className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-white`} />
          <span className="sr-only">
            {showVoiceCommands ? 'Stop listening' : 'Start voice commands'}
          </span>
        </Button>
        
        {/* Voice Command Indicator - Mobile optimized */}
        {showVoiceCommands && (
          <div className={`absolute ${isMobile ? '-top-12 right-0' : '-top-10 right-0'} bg-background border border-border rounded-lg px-3 py-1.5 shadow-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[200px] sm:max-w-none`}>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
              {isMobile ? "Listening..." : "Mic's on. Say something smart."}
            </p>
          </div>
        )}
      </div>
      
      <footer className="py-3 sm:py-4 border-t border-border bg-muted/20 mt-auto">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">MeetingFlow &copy; {new Date().getFullYear()} - Privacy-First Meeting Productivity Tool</span>
          <span className="sm:hidden">MeetingFlow &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}