import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import { useAppStore } from '@/store'
import { VoiceCommandResult } from '@/types/voice'

interface VoiceCommandContextType {
  isListening: boolean
  isSupported: boolean
  lastCommand: string
  lastResult: VoiceCommandResult | null
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}

const VoiceCommandContext = createContext<VoiceCommandContextType | undefined>(undefined)

interface VoiceCommandProviderProps {
  children: ReactNode
}

export function VoiceCommandProvider({ children }: VoiceCommandProviderProps) {
  const [lastCommand, setLastCommand] = useState('')
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null)
  
  const { settings } = useAppStore()
  const { processCommand } = useVoiceCommands()

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening
  } = useVoiceRecognition({
    continuous: false,
    interimResults: false,
    onResult: (transcript: string) => {
      if (!settings.voiceCommandsEnabled) return

      setLastCommand(transcript)
      
      // Process the voice command
      const result = processCommand(transcript)
      setLastResult(result)
      
      // Show visual feedback
      if (result) {
        if (result.success) {
          // Show success toast
          const event = new CustomEvent('toast', {
            detail: {
              title: 'Voice Command Executed',
              description: `"${transcript}"`,
              variant: 'success'
            }
          })
          window.dispatchEvent(event)
        } else {
          // Show error toast
          const event = new CustomEvent('toast', {
            detail: {
              title: 'Command Failed',
              description: result.error || 'Unknown error',
              variant: 'destructive'
            }
          })
          window.dispatchEvent(event)
        }
      } else {
        // Show info toast for unrecognized command
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Command Not Recognized',
            description: `"${transcript}" - Try saying "help" for available commands`,
            variant: 'default'
          }
        })
        window.dispatchEvent(event)
      }

      // Clear command after 5 seconds
      setTimeout(() => {
        setLastCommand('')
        setLastResult(null)
      }, 5000)
    },
    onError: (error) => {
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Voice Recognition Error',
          description: error,
          variant: 'destructive'
        }
      })
      window.dispatchEvent(event)
    }
  })

  // Auto-stop listening if voice commands are disabled
  useEffect(() => {
    if (!settings.voiceCommandsEnabled && isListening) {
      stopListening()
    }
  }, [settings.voiceCommandsEnabled, isListening, stopListening])

  const contextValue: VoiceCommandContextType = {
    isListening,
    isSupported,
    lastCommand,
    lastResult,
    startListening,
    stopListening,
    toggleListening
  }

  return (
    <VoiceCommandContext.Provider value={contextValue}>
      {children}
    </VoiceCommandContext.Provider>
  )
}

export function useVoiceCommandContext() {
  const context = useContext(VoiceCommandContext)
  if (context === undefined) {
    throw new Error('useVoiceCommandContext must be used within a VoiceCommandProvider')
  }
  return context
}