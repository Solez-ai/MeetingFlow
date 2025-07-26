import { useCallback, useMemo } from 'react'
import { VoiceCommand, VoiceCommandResult } from '@/types/voice'
import { useMeetingStore } from '@/store/meetingStore'
import { useAppStore } from '@/store'

export function useVoiceCommands() {
  const {
    addAgendaItem,
    addTask,
    startTranscription,
    stopTranscription,
    isTranscribing
  } = useMeetingStore()
  
  const { setActivePanel } = useAppStore()

  // Define voice commands
  const commands: VoiceCommand[] = useMemo(() => [
    // Agenda commands
    {
      pattern: /^add topic (.+)$/i,
      action: (matches) => {
        const title = matches[1]?.trim() || ''
        addAgendaItem({
          title,
          duration: 10, // Default 10 minutes
          description: `Added via voice command`
        })
        
        // Show success toast
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Topic Added',
            description: `Added "${title}" to agenda`,
            variant: 'success'
          }
        })
        window.dispatchEvent(event)
      },
      description: 'Add a topic to the agenda (e.g., "Add topic project updates")',
      category: 'agenda'
    },
    
    // Task commands
    {
      pattern: /^(?:mark action item|create task|add task) (.+)$/i,
      action: (matches) => {
        const title = matches[1]?.trim() || ''
        addTask({
          title,
          description: 'Created via voice command',
          priority: 'Medium',
          status: 'Todo',
          tags: ['voice-command'],
          createdFrom: 'manual'
        })
        
        // Show success toast
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Task Created',
            description: `Created task: "${title}"`,
            variant: 'success'
          }
        })
        window.dispatchEvent(event)
      },
      description: 'Create a new task (e.g., "Mark action item follow up with client")',
      category: 'tasks'
    },
    
    // Recording commands
    {
      pattern: /^start recording$/i,
      action: () => {
        if (!isTranscribing) {
          startTranscription()
          
          // Show success toast
          const event = new CustomEvent('toast', {
            detail: {
              title: 'Recording Started',
              description: 'Live transcription has been started',
              variant: 'success'
            }
          })
          window.dispatchEvent(event)
        }
      },
      description: 'Start live transcription recording',
      category: 'recording'
    },
    
    {
      pattern: /^stop recording$/i,
      action: () => {
        if (isTranscribing) {
          stopTranscription()
          
          // Show success toast
          const event = new CustomEvent('toast', {
            detail: {
              title: 'Recording Stopped',
              description: 'Live transcription has been stopped',
              variant: 'default'
            }
          })
          window.dispatchEvent(event)
        }
      },
      description: 'Stop live transcription recording',
      category: 'recording'
    },
    
    // Help command
    {
      pattern: /^(?:help|show commands|what can I say)$/i,
      action: () => {
        // Show help toast with available commands
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Voice Commands Available',
            description: 'Check the settings page or voice command panel for full list',
            variant: 'default'
          }
        })
        window.dispatchEvent(event)
      },
      description: 'Show available voice commands',
      category: 'navigation'
    },
    
    // Navigation commands
    {
      pattern: /^(?:show|go to|switch to) agenda$/i,
      action: () => {
        setActivePanel('agenda')
        
        // Show success toast
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Switched to Agenda',
            description: 'Now viewing agenda panel',
            variant: 'default'
          }
        })
        window.dispatchEvent(event)
      },
      description: 'Switch to agenda view',
      category: 'navigation'
    },
    
    {
      pattern: /^(?:show|go to|switch to) (?:tasks|task board)$/i,
      action: () => {
        setActivePanel('tasks')
        
        // Show success toast
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Switched to Tasks',
            description: 'Now viewing task board',
            variant: 'default'
          }
        })
        window.dispatchEvent(event)
      },
      description: 'Switch to task board view',
      category: 'navigation'
    },
    
    {
      pattern: /^(?:show|go to|switch to) (?:notes|note editor)$/i,
      action: () => {
        setActivePanel('notes')
        
        // Show success toast
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Switched to Notes',
            description: 'Now viewing notes editor',
            variant: 'default'
          }
        })
        window.dispatchEvent(event)
      },
      description: 'Switch to notes editor view',
      category: 'navigation'
    }
  ], [addAgendaItem, addTask, startTranscription, stopTranscription, isTranscribing, setActivePanel])

  // Process voice command
  const processCommand = useCallback((transcript: string): VoiceCommandResult | null => {
    const normalizedTranscript = transcript.trim()
    
    for (const command of commands) {
      const matches = normalizedTranscript.match(command.pattern)
      if (matches) {
        try {
          command.action(matches)
          return {
            command,
            matches,
            success: true
          }
        } catch (error) {
          return {
            command,
            matches,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    }
    
    return null
  }, [commands])

  // Get commands by category
  const getCommandsByCategory = useCallback((category: VoiceCommand['category']) => {
    return commands.filter(cmd => cmd.category === category)
  }, [commands])

  return {
    commands,
    processCommand,
    getCommandsByCategory
  }
}