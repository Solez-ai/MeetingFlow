import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVoiceCommands } from '../useVoiceCommands'

// Mock the stores
vi.mock('@/store/meetingStore')
vi.mock('@/store')

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn()
vi.stubGlobal('window', {
  dispatchEvent: mockDispatchEvent
})

describe('useVoiceCommands', () => {
  const mockAddAgendaItem = vi.fn()
  const mockAddTask = vi.fn()
  const mockStartTranscription = vi.fn()
  const mockStopTranscription = vi.fn()
  const mockSetActivePanel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock meeting store
    vi.mocked(require('@/store/meetingStore')).useMeetingStore = vi.fn(() => ({
      addAgendaItem: mockAddAgendaItem,
      addTask: mockAddTask,
      startTranscription: mockStartTranscription,
      stopTranscription: mockStopTranscription,
      isTranscribing: false
    }))
    
    // Mock app store
    vi.mocked(require('@/store')).useAppStore = vi.fn(() => ({
      setActivePanel: mockSetActivePanel
    }))
  })

  describe('Command Processing', () => {
    it('should process "add topic" command correctly', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('add topic project updates')
        
        expect(commandResult).toBeTruthy()
        expect(commandResult?.success).toBe(true)
        expect(mockAddAgendaItem).toHaveBeenCalledWith({
          title: 'project updates',
          duration: 10,
          description: 'Added via voice command'
        })
      })
      
      // Should dispatch success toast
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toast',
          detail: expect.objectContaining({
            title: 'Topic Added',
            description: 'Added "project updates" to agenda',
            variant: 'success'
          })
        })
      )
    })

    it('should process "create task" command correctly', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('create task follow up with client')
        
        expect(commandResult).toBeTruthy()
        expect(commandResult?.success).toBe(true)
        expect(mockAddTask).toHaveBeenCalledWith({
          title: 'follow up with client',
          description: 'Created via voice command',
          priority: 'Medium',
          status: 'Todo',
          tags: ['voice-command'],
          createdFrom: 'manual'
        })
      })
    })

    it('should handle different task command variations', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      const variations = [
        'mark action item review documentation',
        'add task update database',
        'create task send email'
      ]
      
      variations.forEach(command => {
        act(() => {
          const commandResult = result.current.processCommand(command)
          expect(commandResult?.success).toBe(true)
        })
      })
      
      expect(mockAddTask).toHaveBeenCalledTimes(3)
    })

    it('should process "start recording" command', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('start recording')
        
        expect(commandResult?.success).toBe(true)
        expect(mockStartTranscription).toHaveBeenCalled()
      })
    })

    it('should process "stop recording" command when transcribing', () => {
      // Mock transcribing state
      vi.mocked(require('@/store/meetingStore')).useMeetingStore = vi.fn(() => ({
        addAgendaItem: mockAddAgendaItem,
        addTask: mockAddTask,
        startTranscription: mockStartTranscription,
        stopTranscription: mockStopTranscription,
        isTranscribing: true
      }))
      
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('stop recording')
        
        expect(commandResult?.success).toBe(true)
        expect(mockStopTranscription).toHaveBeenCalled()
      })
    })

    it('should not start recording when already transcribing', () => {
      // Mock transcribing state
      vi.mocked(require('@/store/meetingStore')).useMeetingStore = vi.fn(() => ({
        addAgendaItem: mockAddAgendaItem,
        addTask: mockAddTask,
        startTranscription: mockStartTranscription,
        stopTranscription: mockStopTranscription,
        isTranscribing: true
      }))
      
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        result.current.processCommand('start recording')
      })
      
      expect(mockStartTranscription).not.toHaveBeenCalled()
    })

    it('should process navigation commands', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      const navigationCommands = [
        { command: 'show agenda', panel: 'agenda' },
        { command: 'go to tasks', panel: 'tasks' },
        { command: 'switch to notes', panel: 'notes' }
      ]
      
      navigationCommands.forEach(({ command, panel }) => {
        act(() => {
          const commandResult = result.current.processCommand(command)
          expect(commandResult?.success).toBe(true)
        })
        
        expect(mockSetActivePanel).toHaveBeenCalledWith(panel)
      })
    })

    it('should process help command', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      const helpCommands = ['help', 'show commands', 'what can I say']
      
      helpCommands.forEach(command => {
        act(() => {
          const commandResult = result.current.processCommand(command)
          expect(commandResult?.success).toBe(true)
        })
      })
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toast',
          detail: expect.objectContaining({
            title: 'Voice Commands Available'
          })
        })
      )
    })

    it('should return null for unrecognized commands', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('invalid command')
        expect(commandResult).toBeNull()
      })
    })

    it('should handle case insensitive commands', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('ADD TOPIC TEST ITEM')
        expect(commandResult?.success).toBe(true)
        expect(mockAddAgendaItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'TEST ITEM'
          })
        )
      })
    })

    it('should handle commands with extra whitespace', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('  add topic   test item  ')
        expect(commandResult?.success).toBe(true)
        expect(mockAddAgendaItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'test item'
          })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in command execution', () => {
      mockAddAgendaItem.mockImplementation(() => {
        throw new Error('Failed to add agenda item')
      })
      
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('add topic test')
        
        expect(commandResult?.success).toBe(false)
        expect(commandResult?.error).toBe('Failed to add agenda item')
      })
    })

    it('should handle unknown errors', () => {
      mockAddTask.mockImplementation(() => {
        throw 'String error'
      })
      
      const { result } = renderHook(() => useVoiceCommands())
      
      act(() => {
        const commandResult = result.current.processCommand('create task test')
        
        expect(commandResult?.success).toBe(false)
        expect(commandResult?.error).toBe('Unknown error')
      })
    })
  })

  describe('Command Categories', () => {
    it('should return commands by category', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      const agendaCommands = result.current.getCommandsByCategory('agenda')
      const taskCommands = result.current.getCommandsByCategory('tasks')
      const recordingCommands = result.current.getCommandsByCategory('recording')
      const navigationCommands = result.current.getCommandsByCategory('navigation')
      
      expect(agendaCommands).toHaveLength(1)
      expect(taskCommands).toHaveLength(1)
      expect(recordingCommands).toHaveLength(2)
      expect(navigationCommands).toHaveLength(4) // 3 panel switches + help
      
      expect(agendaCommands[0].description).toContain('Add a topic')
      expect(taskCommands[0].description).toContain('Create a new task')
    })

    it('should return empty array for non-existent category', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      const nonExistentCommands = result.current.getCommandsByCategory('non-existent' as any)
      expect(nonExistentCommands).toEqual([])
    })
  })

  describe('Commands List', () => {
    it('should provide all available commands', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      expect(result.current.commands).toHaveLength(8) // Total number of commands
      
      // Verify each command has required properties
      result.current.commands.forEach(command => {
        expect(command).toHaveProperty('pattern')
        expect(command).toHaveProperty('action')
        expect(command).toHaveProperty('description')
        expect(command).toHaveProperty('category')
        expect(typeof command.action).toBe('function')
      })
    })

    it('should have unique command patterns', () => {
      const { result } = renderHook(() => useVoiceCommands())
      
      const patterns = result.current.commands.map(cmd => cmd.pattern.source)
      const uniquePatterns = new Set(patterns)
      
      expect(patterns.length).toBe(uniquePatterns.size)
    })
  })

  describe('Integration with Stores', () => {
    it('should update when store state changes', () => {
      const { rerender } = renderHook(() => useVoiceCommands())
      
      // Change transcribing state
      vi.mocked(require('@/store/meetingStore')).useMeetingStore = vi.fn(() => ({
        addAgendaItem: mockAddAgendaItem,
        addTask: mockAddTask,
        startTranscription: mockStartTranscription,
        stopTranscription: mockStopTranscription,
        isTranscribing: true
      }))
      
      rerender()
      
      const { result } = renderHook(() => useVoiceCommands())
      
      // Should reflect new state in command behavior
      act(() => {
        result.current.processCommand('start recording')
      })
      
      expect(mockStartTranscription).not.toHaveBeenCalled()
    })
  })
})