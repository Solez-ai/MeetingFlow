import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMeetingStore } from '../meetingStore'
import { mockMeeting, mockAgendaItems, mockTasks } from '../../test/fixtures'
import { mockLocalStorage } from '../../test/utils'

// Mock the transcription service
vi.mock('@/services/transcriptionService', () => ({
  initializeAssemblyAI: vi.fn(),
}))

describe('Meeting Store', () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>

  beforeEach(() => {
    mockStorage = mockLocalStorage()
    vi.stubGlobal('localStorage', mockStorage)
    vi.clearAllMocks()
    
    // Reset the store state
    useMeetingStore.setState({
      meetings: [],
      currentMeetingId: null,
      currentMeeting: null,
      assemblyApiKey: null,
      isTranscribing: false,
      transcriptionStatus: null,
    })
  })

  describe('Meeting Management', () => {
    it('should initialize meetings from localStorage', () => {
      const storedMeetings = [mockMeeting]
      mockStorage.getItem.mockReturnValue(JSON.stringify(storedMeetings))

      const { initializeMeetings } = useMeetingStore.getState()
      initializeMeetings()

      const { meetings } = useMeetingStore.getState()
      expect(meetings).toEqual(storedMeetings)
    })

    it('should handle localStorage errors gracefully', () => {
      mockStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { initializeMeetings } = useMeetingStore.getState()
      initializeMeetings()

      const { meetings } = useMeetingStore.getState()
      expect(meetings).toEqual([])
    })

    it('should create a new meeting', () => {
      const { createMeeting } = useMeetingStore.getState()
      const meeting = createMeeting('Test Meeting')

      expect(meeting.title).toBe('Test Meeting')
      expect(meeting.id).toBeTruthy()
      expect(meeting.startTime).toBeTruthy()
      expect(meeting.agenda).toEqual([])
      expect(meeting.notes).toEqual([])
      expect(meeting.tasks).toEqual([])
      expect(meeting.transcripts).toEqual([])

      const { meetings, currentMeeting, currentMeetingId } = useMeetingStore.getState()
      expect(meetings).toContain(meeting)
      expect(currentMeeting).toEqual(meeting)
      expect(currentMeetingId).toBe(meeting.id)
      expect(mockStorage.setItem).toHaveBeenCalledWith('meetings', JSON.stringify([meeting]))
    })

    it('should set current meeting', () => {
      // First add a meeting
      useMeetingStore.setState({ meetings: [mockMeeting] })

      const { setCurrentMeeting } = useMeetingStore.getState()
      setCurrentMeeting(mockMeeting.id)

      const { currentMeeting, currentMeetingId } = useMeetingStore.getState()
      expect(currentMeeting).toEqual(mockMeeting)
      expect(currentMeetingId).toBe(mockMeeting.id)
    })

    it('should load a meeting by ID', () => {
      useMeetingStore.setState({ meetings: [mockMeeting] })

      const { loadMeeting } = useMeetingStore.getState()
      const meeting = loadMeeting(mockMeeting.id)

      expect(meeting).toEqual(mockMeeting)
      const { currentMeeting, currentMeetingId } = useMeetingStore.getState()
      expect(currentMeeting).toEqual(mockMeeting)
      expect(currentMeetingId).toBe(mockMeeting.id)
    })

    it('should update a meeting', () => {
      useMeetingStore.setState({ 
        meetings: [mockMeeting],
        currentMeetingId: mockMeeting.id,
        currentMeeting: mockMeeting
      })

      const { updateMeeting } = useMeetingStore.getState()
      const updates = { title: 'Updated Meeting Title' }
      updateMeeting(mockMeeting.id, updates)

      const { meetings, currentMeeting } = useMeetingStore.getState()
      expect(meetings[0].title).toBe('Updated Meeting Title')
      expect(currentMeeting?.title).toBe('Updated Meeting Title')
      expect(mockStorage.setItem).toHaveBeenCalled()
    })

    it('should remove a meeting', () => {
      const otherMeeting = { ...mockMeeting, id: 'other-id', title: 'Other Meeting' }
      useMeetingStore.setState({ 
        meetings: [mockMeeting, otherMeeting],
        currentMeetingId: mockMeeting.id,
        currentMeeting: mockMeeting
      })

      const { removeMeeting } = useMeetingStore.getState()
      removeMeeting(mockMeeting.id)

      const { meetings, currentMeeting, currentMeetingId } = useMeetingStore.getState()
      expect(meetings).toEqual([otherMeeting])
      expect(currentMeeting).toEqual(otherMeeting)
      expect(currentMeetingId).toBe(otherMeeting.id)
    })

    it('should delete a meeting', () => {
      useMeetingStore.setState({ 
        meetings: [mockMeeting],
        currentMeetingId: mockMeeting.id,
        currentMeeting: mockMeeting
      })

      const { deleteMeeting } = useMeetingStore.getState()
      deleteMeeting(mockMeeting.id)

      const { meetings, currentMeeting, currentMeetingId } = useMeetingStore.getState()
      expect(meetings).toEqual([])
      expect(currentMeeting).toBeNull()
      expect(currentMeetingId).toBeNull()
    })
  })

  describe('Agenda Management', () => {
    beforeEach(() => {
      useMeetingStore.setState({
        meetings: [mockMeeting],
        currentMeetingId: mockMeeting.id,
        currentMeeting: mockMeeting
      })
    })

    it('should add an agenda item', () => {
      const { addAgendaItem } = useMeetingStore.getState()
      const newItem = {
        title: 'New Agenda Item',
        duration: 15,
        description: 'Test description'
      }

      addAgendaItem(newItem)

      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting?.agenda).toHaveLength(mockMeeting.agenda.length + 1)
      
      const addedItem = currentMeeting?.agenda.find(item => item.title === newItem.title)
      expect(addedItem).toBeTruthy()
      expect(addedItem?.id).toBeTruthy()
      expect(addedItem?.order).toBe(mockMeeting.agenda.length)
    })

    it('should not add agenda item without current meeting', () => {
      useMeetingStore.setState({ currentMeetingId: null, currentMeeting: null })

      const { addAgendaItem } = useMeetingStore.getState()
      const newItem = {
        title: 'New Agenda Item',
        duration: 15
      }

      addAgendaItem(newItem)

      // Should not crash or change state
      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting).toBeNull()
    })

    it('should update an agenda item', () => {
      const { updateAgendaItem } = useMeetingStore.getState()
      const itemId = mockMeeting.agenda[0].id
      const updates = { title: 'Updated Title', duration: 25 }

      updateAgendaItem(itemId, updates)

      const { currentMeeting } = useMeetingStore.getState()
      const updatedItem = currentMeeting?.agenda.find(item => item.id === itemId)
      expect(updatedItem?.title).toBe('Updated Title')
      expect(updatedItem?.duration).toBe(25)
    })

    it('should remove an agenda item', () => {
      const { removeAgendaItem } = useMeetingStore.getState()
      const itemId = mockMeeting.agenda[0].id

      removeAgendaItem(itemId)

      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting?.agenda).toHaveLength(mockMeeting.agenda.length - 1)
      expect(currentMeeting?.agenda.find(item => item.id === itemId)).toBeUndefined()
    })

    it('should reorder agenda items', () => {
      const { reorderAgendaItems } = useMeetingStore.getState()
      const itemIds = mockMeeting.agenda.map(item => item.id).reverse()

      reorderAgendaItems(itemIds)

      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting?.agenda[0].id).toBe(itemIds[0])
      expect(currentMeeting?.agenda[0].order).toBe(0)
      expect(currentMeeting?.agenda[1].order).toBe(1)
    })

    it('should generate time-balanced agenda', () => {
      const { generateTimeBalancedAgenda } = useMeetingStore.getState()
      const totalDuration = 60

      generateTimeBalancedAgenda(totalDuration)

      const { currentMeeting } = useMeetingStore.getState()
      const expectedTimePerItem = Math.floor((totalDuration - 5) / mockMeeting.agenda.length)
      
      currentMeeting?.agenda.forEach(item => {
        expect(item.duration).toBe(expectedTimePerItem)
      })
    })
  })

  describe('Task Management', () => {
    beforeEach(() => {
      useMeetingStore.setState({
        meetings: [mockMeeting],
        currentMeetingId: mockMeeting.id,
        currentMeeting: mockMeeting
      })
    })

    it('should add a task', () => {
      const { addTask } = useMeetingStore.getState()
      const newTask = {
        title: 'New Task',
        description: 'Test description',
        priority: 'High' as const,
        status: 'Todo' as const,
        tags: ['test']
      }

      const taskId = addTask(newTask)

      expect(taskId).toBeTruthy()
      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting?.tasks).toHaveLength(mockMeeting.tasks.length + 1)
      
      const addedTask = currentMeeting?.tasks.find(task => task.id === taskId)
      expect(addedTask?.title).toBe(newTask.title)
      expect(addedTask?.created).toBeTruthy()
    })

    it('should not add task without current meeting', () => {
      useMeetingStore.setState({ currentMeetingId: null, currentMeeting: null })

      const { addTask } = useMeetingStore.getState()
      const newTask = {
        title: 'New Task',
        priority: 'High' as const,
        status: 'Todo' as const,
        tags: []
      }

      const taskId = addTask(newTask)

      expect(taskId).toBe('')
    })

    it('should update a task', () => {
      const { updateTask } = useMeetingStore.getState()
      const taskId = mockMeeting.tasks[0].id
      const updates = { title: 'Updated Task', priority: 'Low' as const }

      updateTask(taskId, updates)

      const { currentMeeting } = useMeetingStore.getState()
      const updatedTask = currentMeeting?.tasks.find(task => task.id === taskId)
      expect(updatedTask?.title).toBe('Updated Task')
      expect(updatedTask?.priority).toBe('Low')
    })

    it('should remove a task', () => {
      const { removeTask } = useMeetingStore.getState()
      const taskId = mockMeeting.tasks[0].id

      removeTask(taskId)

      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting?.tasks).toHaveLength(mockMeeting.tasks.length - 1)
      expect(currentMeeting?.tasks.find(task => task.id === taskId)).toBeUndefined()
    })

    it('should toggle task status', () => {
      const { toggleTaskStatus } = useMeetingStore.getState()
      const taskId = mockMeeting.tasks[0].id
      const originalStatus = mockMeeting.tasks[0].status

      toggleTaskStatus(taskId)

      const { currentMeeting } = useMeetingStore.getState()
      const updatedTask = currentMeeting?.tasks.find(task => task.id === taskId)
      
      if (originalStatus === 'Todo') {
        expect(updatedTask?.status).toBe('In Progress')
      } else if (originalStatus === 'In Progress') {
        expect(updatedTask?.status).toBe('Done')
      } else {
        expect(updatedTask?.status).toBe('Todo')
      }
    })
  })

  describe('Transcription Management', () => {
    it('should set AssemblyAI API key', () => {
      const { setAssemblyApiKey } = useMeetingStore.getState()
      const apiKey = 'test-api-key'

      setAssemblyApiKey(apiKey)

      const { assemblyApiKey } = useMeetingStore.getState()
      expect(assemblyApiKey).toBe(apiKey)
      expect(mockStorage.setItem).toHaveBeenCalledWith('assemblyApiKey', apiKey)
    })

    it('should start transcription', () => {
      const { startTranscription } = useMeetingStore.getState()

      startTranscription()

      const { isTranscribing } = useMeetingStore.getState()
      expect(isTranscribing).toBe(true)
    })

    it('should stop transcription', () => {
      useMeetingStore.setState({ isTranscribing: true })

      const { stopTranscription } = useMeetingStore.getState()
      stopTranscription()

      const { isTranscribing } = useMeetingStore.getState()
      expect(isTranscribing).toBe(false)
    })

    it('should set transcription status', () => {
      const { setTranscriptionStatus } = useMeetingStore.getState()
      const status = { status: 'processing', progress: 50 }

      setTranscriptionStatus(status)

      const { transcriptionStatus } = useMeetingStore.getState()
      expect(transcriptionStatus).toEqual(status)
    })

    it('should add transcript chunk', () => {
      useMeetingStore.setState({
        meetings: [mockMeeting],
        currentMeetingId: mockMeeting.id,
        currentMeeting: mockMeeting
      })

      const { addTranscriptChunk } = useMeetingStore.getState()
      const newChunk = {
        text: 'New transcript chunk',
        timestamp: Date.now(),
        confidence: 0.95,
        speaker: 'Speaker 1'
      }

      addTranscriptChunk(newChunk)

      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting?.transcripts).toHaveLength(mockMeeting.transcripts.length + 1)
      
      const addedChunk = currentMeeting?.transcripts.find(chunk => chunk.text === newChunk.text)
      expect(addedChunk?.id).toBeTruthy()
    })

    it('should update transcripts', () => {
      useMeetingStore.setState({
        meetings: [mockMeeting],
        currentMeetingId: mockMeeting.id,
        currentMeeting: mockMeeting
      })

      const { updateTranscripts } = useMeetingStore.getState()
      const newTranscripts = [
        {
          id: '1',
          text: 'Updated transcript',
          timestamp: Date.now(),
          confidence: 0.98,
          speaker: 'Speaker 1'
        }
      ]

      updateTranscripts(newTranscripts)

      const { currentMeeting } = useMeetingStore.getState()
      expect(currentMeeting?.transcripts).toEqual(newTranscripts)
    })
  })

  describe('Storage Operations', () => {
    it('should save meeting to storage', () => {
      useMeetingStore.setState({ meetings: [mockMeeting] })

      const { saveMeetingToStorage } = useMeetingStore.getState()
      saveMeetingToStorage()

      expect(mockStorage.setItem).toHaveBeenCalledWith('meetings', JSON.stringify([mockMeeting]))
    })

    it('should handle storage errors when saving', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      useMeetingStore.setState({ meetings: [mockMeeting] })

      const { saveMeetingToStorage } = useMeetingStore.getState()
      
      // Should not throw
      expect(() => saveMeetingToStorage()).not.toThrow()
    })
  })
})