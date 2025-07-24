import { useEffect } from 'react'
import { useVoiceCommandContext } from '@/components/voice/VoiceCommandProvider'
import { useAppStore } from '@/store'

export function useKeyboardShortcuts() {
  const { toggleListening, isSupported } = useVoiceCommandContext()
  const { settings } = useAppStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Voice command shortcuts
      if (isSupported && settings.voiceCommandsEnabled) {
        // Ctrl/Cmd + Shift + V to toggle voice commands
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
          event.preventDefault()
          toggleListening()
          return
        }
        
        // Space bar to toggle voice commands (when not in input fields)
        if (event.code === 'Space' && event.target instanceof HTMLElement) {
          const isInInputField = event.target.tagName === 'INPUT' || 
                                event.target.tagName === 'TEXTAREA' || 
                                event.target.contentEditable === 'true'
          
          if (!isInInputField && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            toggleListening()
            return
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleListening, isSupported, settings.voiceCommandsEnabled])
}

// Hook to be used in components that need keyboard shortcuts
export function useVoiceKeyboardShortcuts() {
  useKeyboardShortcuts()
}