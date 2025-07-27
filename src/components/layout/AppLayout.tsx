import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { MicIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useState, useEffect, useRef } from 'react'
import { useVoiceCommandContext } from '@/components/voice/VoiceCommandProvider'
import { buttonInteractions } from '@/utils/microInteractions'
import { announceToScreenReader } from '@/utils/accessibility'

export function AppLayout() {
  const { isListening, toggleListening, isSupported } = useVoiceCommandContext()
  const [isMobile, setIsMobile] = useState(false)
  const voiceButtonRef = useRef<HTMLButtonElement>(null)
  
  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Add micro-interactions to voice button
  useEffect(() => {
    if (voiceButtonRef.current) {
      const cleanup = buttonInteractions.addRippleEffect(voiceButtonRef.current, {
        hapticFeedback: true
      })
      return cleanup
    }
  }, [])
  
  const handleVoiceToggle = () => {
    if (!isSupported) {
      announceToScreenReader('Voice commands are not supported in this browser', 'assertive')
      return
    }
    
    toggleListening()
    announceToScreenReader(
      isListening ? 'Voice commands stopped' : 'Voice commands started, listening for commands',
      'assertive'
    )
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main 
        id="main-content" 
        className="flex-1 w-full"
        role="main"
        aria-label="Main content"
        tabIndex={-1}
      >
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl h-full">
          <div className="h-full min-h-[calc(100vh-7rem)] sm:min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Voice Command Button - Fixed Position with mobile optimization */}
      <div className={`fixed z-40 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}>
        <Button 
          ref={voiceButtonRef}
          size="icon" 
          className={`${isMobile ? 'h-14 w-14' : 'h-12 w-12'} rounded-full shadow-lg transition-all duration-300 touch-manipulation focus-ring ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 animate-pulse' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:from-indigo-700 active:to-purple-800 hover:scale-105'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleVoiceToggle}
          disabled={!isSupported}
          aria-label={
            !isSupported 
              ? 'Voice commands not supported' 
              : isListening 
              ? 'Stop voice commands (Ctrl+Shift+V)' 
              : 'Start voice commands (Ctrl+Shift+V)'
          }
          aria-pressed={isListening}
          title={
            !isSupported 
              ? 'Voice commands not supported in this browser' 
              : isListening 
              ? 'Click to stop listening for voice commands' 
              : 'Click to start listening for voice commands'
          }
        >
          <MicIcon className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-white transition-transform ${
            isListening ? 'scale-110' : ''
          }`} />
        </Button>
        
        {/* Voice Command Indicator - Mobile optimized */}
        {isListening && (
          <div 
            className={`absolute ${isMobile ? '-top-12 right-0' : '-top-10 right-0'} bg-background border border-border rounded-lg px-3 py-1.5 shadow-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[200px] sm:max-w-none`}
            role="status"
            aria-live="polite"
          >
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
              {isMobile ? "Listening..." : "Listening for voice commands..."}
            </p>
          </div>
        )}
      </div>
      
      <footer 
        className="py-3 sm:py-4 border-t border-border bg-muted/20 mt-auto"
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">MeetingFlow &copy; {new Date().getFullYear()} - Privacy-First Meeting Productivity Tool</span>
          <span className="sm:hidden">MeetingFlow &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}