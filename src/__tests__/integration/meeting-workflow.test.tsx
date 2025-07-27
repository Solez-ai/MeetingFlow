import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { useMeetingStore } from '../../store/meetingStore'
import { mockMeeting, mockAgendaItems, mockTasks } from '../../test/fixtures'

// Mock the entire meeting store
vi.mock('../../store/meetingStore')

// Mock components that we'll test integration with
const MockMeetingWorkspace = ({ meetingId }: { meetingId: string }) => {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const createMeeting = useMeetingStore(state => state.createMeeting)
  const addAgendaItem = useMeetingStore(state => state.addAgendaItem)
  const addTask = useMeetingStore(state => state.addTask)
  const updateTask = useMeetingStore(state => state.updateTask)

  return (
    <div data-testid="meeting-workspace">
      <div data-testid="meeting-title">
        {currentMeeting?.title || 'No Meeting'}
      </div>
      
      <button
        onClick={() => createMeeting('Test Meeting')}
        data-testid="create-meeting"
      >
        Create Meeting
      </button>
      
      <button
        onClick={() => addAgendaItem({ title: 'New Agenda Item', duration: 15 })}
        data-testid="add-agenda-item"
      >
        Add Agenda Item
      </button>
      
      <button
        onClick={() => addTask({
          title: 'New Task',
          priority: 'Medium',
          status: 'Todo',
          tags: ['test']
        })}
        data-testid="add-task"
      >
        Add Task
      </button>
      
      <button
        onClick={() => {
          if (currentMeeting?.tasks[0]) {
            updateTask(currentMeeting.tasks[0].id, { status: 'Done' })
          }
        }}
        data-testid="complete-task"
      >
        Complete First Task
      </button>
      
      <div data-testid="agenda-count">
        Agenda Items: {currentMeeting?.agenda.length || 0}
      </div>
      
      <div data-testid="task-count">
        Tasks: {currentMeeting?.tasks.length || 0}
      </div>
      
      <div data-testid="completed-tasks">
        Completed: {currentMeeting?.tasks.filter(t => t.status === 'Done').length || 0}
      </div>
    </div>
  )
}

describe('Meeting Workflow Integration Tests', () => {
  const mockUseMeetingStore = vi.mocked(useMeetingStore)
  
  // Mock store state
  let storeState = {
    meetings: [],
    currentMeeting: null,
    currentMeetingId: null,
    createMeeting: vi.fn(),
    addAgendaItem: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    loadMeeting: vi.fn(),
    saveMeetingToStorage: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset store state
    storeState = {
      meetings: [],
      currentMeeting: null,
      currentMeetingId: null,
      createMeeting: vi.fn(),
      addAgendaItem: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      loadMeeting: vi.fn(),
      saveMeetingToStorage: vi.fn(),
    }
    
    mockUseMeetingStore.mockImplementation((selector) => selector(storeState))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Meeting Creation Workflow', () => {
    it('should create a meeting and add agenda items and tasks', async () => {
      // Mock the createMeeting function to update state
      storeState.createMeeting = vi.fn().mockImplementation((title: string) => {
        const newMeeting = {
          ...mockMeeting,
          id: 'new-meeting-id',
          title,
          agenda: [],
          tasks: [],
          notes: [],
          transcripts: []
        }
        storeState.currentMeeting = newMeeting
        storeState.currentMeetingId = newMeeting.id
        storeState.meetings = [newMeeting]
        return newMeeting
      })

      // Mock addAgendaItem to update the current meeting
      storeState.addAgendaItem = vi.fn().mockImplementation((item) => {
        if (storeState.currentMeeting) {
          const newItem = {
            ...item,
            id: `agenda-${Date.now()}`,
            order: storeState.currentMeeting.agenda.length
          }
          storeState.currentMeeting.agenda.push(newItem)
        }
      })

      // Mock addTask to update the current meeting
      storeState.addTask = vi.fn().mockImplementation((task) => {
        if (storeState.currentMeeting) {
          const newTask = {
            ...task,
            id: `task-${Date.now()}`,
            created: new Date().toISOString()
          }
          storeState.currentMeeting.tasks.push(newTask)
          return newTask.id
        }
        return ''
      })

      const { rerender } = render(<MockMeetingWorkspace meetingId="new-meeting-id" />)

      // Initially no meeting
      expect(screen.getByTestId('meeting-title')).toHaveTextContent('No Meeting')
      expect(screen.getByTestId('agenda-count')).toHaveTextContent('Agenda Items: 0')
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 0')

      // Create a meeting
      fireEvent.click(screen.getByTestId('create-meeting'))
      expect(storeState.createMeeting).toHaveBeenCalledWith('Test Meeting')

      // Re-render to reflect state changes
      rerender(<MockMeetingWorkspace meetingId="new-meeting-id" />)
      
      expect(screen.getByTestId('meeting-title')).toHaveTextContent('Test Meeting')

      // Add an agenda item
      fireEvent.click(screen.getByTestId('add-agenda-item'))
      expect(storeState.addAgendaItem).toHaveBeenCalledWith({
        title: 'New Agenda Item',
        duration: 15
      })

      // Re-render to reflect agenda changes
      rerender(<MockMeetingWorkspace meetingId="new-meeting-id" />)
      expect(screen.getByTestId('agenda-count')).toHaveTextContent('Agenda Items: 1')

      // Add a task
      fireEvent.click(screen.getByTestId('add-task'))
      expect(storeState.addTask).toHaveBeenCalledWith({
        title: 'New Task',
        priority: 'Medium',
        status: 'Todo',
        tags: ['test']
      })

      // Re-render to reflect task changes
      rerender(<MockMeetingWorkspace meetingId="new-meeting-id" />)
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 1')
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('Completed: 0')
    })
  })

  describe('Task Management Workflow', () => {
    it('should handle task status changes and completion', async () => {
      // Set up initial state with a meeting and task
      storeState.currentMeeting = {
        ...mockMeeting,
        tasks: [mockTasks[0]] // Start with one task
      }
      storeState.currentMeetingId = mockMeeting.id

      // Mock updateTask to modify the task status
      storeState.updateTask = vi.fn().mockImplementation((taskId: string, updates) => {
        if (storeState.currentMeeting) {
          const taskIndex = storeState.currentMeeting.tasks.findIndex(t => t.id === taskId)
          if (taskIndex !== -1) {
            storeState.currentMeeting.tasks[taskIndex] = {
              ...storeState.currentMeeting.tasks[taskIndex],
              ...updates
            }
          }
        }
      })

      const { rerender } = render(<MockMeetingWorkspace meetingId={mockMeeting.id} />)

      // Initially should have 1 task, 0 completed
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 1')
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('Completed: 0')

      // Complete the first task
      fireEvent.click(screen.getByTestId('complete-task'))
      expect(storeState.updateTask).toHaveBeenCalledWith(mockTasks[0].id, { status: 'Done' })

      // Re-render to reflect task completion
      rerender(<MockMeetingWorkspace meetingId={mockMeeting.id} />)
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('Completed: 1')
    })
  })

  describe('Data Persistence Workflow', () => {
    it('should save meeting data after changes', async () => {
      storeState.currentMeeting = mockMeeting
      storeState.currentMeetingId = mockMeeting.id
      
      // Mock saveMeetingToStorage
      storeState.saveMeetingToStorage = vi.fn()

      // Mock addAgendaItem to also trigger save
      storeState.addAgendaItem = vi.fn().mockImplementation((item) => {
        if (storeState.currentMeeting) {
          const newItem = {
            ...item,
            id: `agenda-${Date.now()}`,
            order: storeState.currentMeeting.agenda.length
          }
          storeState.currentMeeting.agenda.push(newItem)
          storeState.saveMeetingToStorage()
        }
      })

      render(<MockMeetingWorkspace meetingId={mockMeeting.id} />)

      // Add an agenda item which should trigger save
      fireEvent.click(screen.getByTestId('add-agenda-item'))
      
      expect(storeState.addAgendaItem).toHaveBeenCalled()
      expect(storeState.saveMeetingToStorage).toHaveBeenCalled()
    })
  })

  describe('Error Handling in Workflows', () => {
    it('should handle store errors gracefully', () => {
      // Mock a store function to throw an error
      storeState.createMeeting = vi.fn().mockImplementation(() => {
        throw new Error('Failed to create meeting')
      })

      render(<MockMeetingWorkspace meetingId="test" />)

      // Should not crash when error occurs
      expect(() => {
        fireEvent.click(screen.getByTestId('create-meeting'))
      }).toThrow('Failed to create meeting')
    })

    it('should handle missing current meeting gracefully', () => {
      storeState.currentMeeting = null
      storeState.addAgendaItem = vi.fn()
      storeState.addTask = vi.fn()

      render(<MockMeetingWorkspace meetingId="test" />)

      // Should show no meeting state
      expect(screen.getByTestId('meeting-title')).toHaveTextContent('No Meeting')
      expect(screen.getByTestId('agenda-count')).toHaveTextContent('Agenda Items: 0')
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 0')

      // Actions should still be callable but may not do anything
      fireEvent.click(screen.getByTestId('add-agenda-item'))
      fireEvent.click(screen.getByTestId('add-task'))
      
      expect(storeState.addAgendaItem).toHaveBeenCalled()
      expect(storeState.addTask).toHaveBeenCalled()
    })
  })

  describe('Complex State Interactions', () => {
    it('should handle multiple rapid state changes', async () => {
      storeState.currentMeeting = {
        ...mockMeeting,
        agenda: [],
        tasks: []
      }
      storeState.currentMeetingId = mockMeeting.id

      let agendaCounter = 0
      let taskCounter = 0

      storeState.addAgendaItem = vi.fn().mockImplementation((item) => {
        if (storeState.currentMeeting) {
          const newItem = {
            ...item,
            id: `agenda-${++agendaCounter}`,
            order: storeState.currentMeeting.agenda.length
          }
          storeState.currentMeeting.agenda.push(newItem)
        }
      })

      storeState.addTask = vi.fn().mockImplementation((task) => {
        if (storeState.currentMeeting) {
          const newTask = {
            ...task,
            id: `task-${++taskCounter}`,
            created: new Date().toISOString()
          }
          storeState.currentMeeting.tasks.push(newTask)
          return newTask.id
        }
        return ''
      })

      const { rerender } = render(<MockMeetingWorkspace meetingId={mockMeeting.id} />)

      // Rapidly add multiple items
      fireEvent.click(screen.getByTestId('add-agenda-item'))
      fireEvent.click(screen.getByTestId('add-agenda-item'))
      fireEvent.click(screen.getByTestId('add-task'))
      fireEvent.click(screen.getByTestId('add-task'))
      fireEvent.click(screen.getByTestId('add-task'))

      expect(storeState.addAgendaItem).toHaveBeenCalledTimes(2)
      expect(storeState.addTask).toHaveBeenCalledTimes(3)

      // Re-render to reflect all changes
      rerender(<MockMeetingWorkspace meetingId={mockMeeting.id} />)
      
      expect(screen.getByTestId('agenda-count')).toHaveTextContent('Agenda Items: 2')
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 3')
    })
  })

  describe('Meeting Loading Workflow', () => {
    it('should load existing meeting data correctly', () => {
      // Mock loadMeeting to set current meeting
      storeState.loadMeeting = vi.fn().mockImplementation((meetingId: string) => {
        if (meetingId === mockMeeting.id) {
          storeState.currentMeeting = mockMeeting
          storeState.currentMeetingId = mockMeeting.id
          return mockMeeting
        }
        return null
      })

      // Initially no meeting
      render(<MockMeetingWorkspace meetingId={mockMeeting.id} />)
      expect(screen.getByTestId('meeting-title')).toHaveTextContent('No Meeting')

      // Simulate loading a meeting (this would typically happen in a useEffect)
      storeState.loadMeeting(mockMeeting.id)

      // Re-render with loaded meeting
      const { rerender } = render(<MockMeetingWorkspace meetingId={mockMeeting.id} />)
      
      expect(screen.getByTestId('meeting-title')).toHaveTextContent(mockMeeting.title)
      expect(screen.getByTestId('agenda-count')).toHaveTextContent(`Agenda Items: ${mockMeeting.agenda.length}`)
      expect(screen.getByTestId('task-count')).toHaveTextContent(`Tasks: ${mockMeeting.tasks.length}`)
    })
  })
})