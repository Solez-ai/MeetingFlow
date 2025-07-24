import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Meeting, Task, TranscriptChunk, TranscriptionStatus } from '@/types'
import { initializeAssemblyAI } from '@/services/transcriptionService'

export interface MeetingState {
  meetings: Meeting[]
  currentMeetingId: string | null
  currentMeeting: Meeting | null
  
  // AssemblyAI configuration
  assemblyApiKey: string | null
  isTranscribing: boolean
  transcriptionStatus: TranscriptionStatus | null
  
  // Meeting actions
  initializeMeetings: () => void
  setCurrentMeeting: (meetingId: string) => void
  createMeeting: (title: string) => Meeting
  loadMeeting: (id: string) => Meeting | undefined
  addMeeting: (meeting: Omit<Meeting, 'id' | 'tasks'>) => void
  updateMeeting: (id: string, updates: Partial<Omit<Meeting, 'id'>>) => void
  removeMeeting: (id: string) => void
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'created'>) => string
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void
  removeTask: (id: string) => void
  toggleTaskStatus: (id: string) => void
  
  // Transcription actions
  setAssemblyApiKey: (apiKey: string) => void
  startTranscription: () => void
  stopTranscription: () => void
  setTranscriptionStatus: (status: TranscriptionStatus) => void
  addTranscriptChunk: (chunk: Omit<TranscriptChunk, 'id'>) => void
  updateTranscripts: (transcripts: TranscriptChunk[]) => void
}

// Load meetings from localStorage
const loadMeetingsFromStorage = (): Meeting[] => {
  try {
    const storedMeetings = localStorage.getItem('meetings')
    if (storedMeetings) {
      return JSON.parse(storedMeetings)
    }
  } catch (error) {
    console.error('Error loading meetings from localStorage:', error)
  }
  return []
}

// Save meetings to localStorage
const saveMeetingsToStorage = (meetings: Meeting[]) => {
  try {
    localStorage.setItem('meetings', JSON.stringify(meetings))
  } catch (error) {
    console.error('Error saving meetings to localStorage:', error)
  }
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  currentMeetingId: null,
  currentMeeting: null,
  
  // AssemblyAI configuration
  assemblyApiKey: localStorage.getItem('assemblyApiKey') || null,
  isTranscribing: false,
  transcriptionStatus: null,
  
  // Meeting actions
  initializeMeetings: () => {
    const meetings = loadMeetingsFromStorage()
    set({ meetings })
  },
  
  setCurrentMeeting: (meetingId) => {
    set({ 
      currentMeetingId: meetingId,
      currentMeeting: get().meetings.find(m => m.id === meetingId) || null
    })
  },
  
  createMeeting: (title) => {
    const newMeeting: Meeting = {
      id: uuidv4(),
      title,
      startTime: new Date().toISOString(),
      agenda: [],
      notes: [],
      tasks: [],
      transcripts: [],
      metadata: {
        duration: 60,
        participants: [],
        tags: []
      }
    }
    
    set(state => {
      const updatedMeetings = [...state.meetings, newMeeting]
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeetingId: newMeeting.id,
        currentMeeting: newMeeting
      }
    })
    
    return newMeeting
  },
  
  loadMeeting: (id) => {
    const meeting = get().meetings.find(m => m.id === id)
    if (meeting) {
      set({
        currentMeetingId: id,
        currentMeeting: meeting
      })
    }
    return meeting
  },
  
  addMeeting: (meeting) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: uuidv4(),
      tasks: [],
      transcripts: [],
      agenda: meeting.agenda || [],
      notes: meeting.notes || [],
      metadata: meeting.metadata || {
        participants: [],
        tags: []
      }
    }
    
    set(state => {
      const updatedMeetings = [...state.meetings, newMeeting]
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeetingId: newMeeting.id,
        currentMeeting: newMeeting
      }
    })
  },
  
  updateMeeting: (id, updates) => {
    set(state => {
      const updatedMeetings = state.meetings.map(meeting => 
        meeting.id === id ? { ...meeting, ...updates } : meeting
      )
      
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeeting: state.currentMeetingId === id 
          ? updatedMeetings.find(m => m.id === id) || null
          : state.currentMeeting
      }
    })
  },
  
  removeMeeting: (id) => {
    set(state => {
      const filteredMeetings = state.meetings.filter(meeting => meeting.id !== id)
      const needNewCurrent = state.currentMeetingId === id
      
      saveMeetingsToStorage(filteredMeetings)
      
      return {
        meetings: filteredMeetings,
        currentMeetingId: needNewCurrent ? (filteredMeetings[0]?.id || null) : state.currentMeetingId,
        currentMeeting: needNewCurrent ? (filteredMeetings[0] || null) : state.currentMeeting
      }
    })
  },
  
  // Task actions
  addTask: (task) => {
    if (!get().currentMeetingId) return ''
    
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      created: new Date().toISOString(),
      tags: task.tags || []
    }
    
    set(state => {
      if (!state.currentMeeting) return state
      
      const updatedMeeting = {
        ...state.currentMeeting,
        tasks: [...state.currentMeeting.tasks, newTask]
      }
      
      const updatedMeetings = state.meetings.map(meeting => 
        meeting.id === state.currentMeetingId ? updatedMeeting : meeting
      )
      
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeeting: updatedMeeting
      }
    })
    
    return newTask.id
  },
  
  updateTask: (id, updates) => {
    if (!get().currentMeetingId) return
    
    set(state => {
      if (!state.currentMeeting) return state
      
      const updatedTasks = state.currentMeeting.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
      
      const updatedMeeting = {
        ...state.currentMeeting,
        tasks: updatedTasks
      }
      
      const updatedMeetings = state.meetings.map(meeting => 
        meeting.id === state.currentMeetingId ? updatedMeeting : meeting
      )
      
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeeting: updatedMeeting
      }
    })
  },
  
  removeTask: (id) => {
    if (!get().currentMeetingId) return
    
    set(state => {
      if (!state.currentMeeting) return state
      
      const updatedTasks = state.currentMeeting.tasks.filter(task => task.id !== id)
      
      const updatedMeeting = {
        ...state.currentMeeting,
        tasks: updatedTasks
      }
      
      const updatedMeetings = state.meetings.map(meeting => 
        meeting.id === state.currentMeetingId ? updatedMeeting : meeting
      )
      
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeeting: updatedMeeting
      }
    })
  },
  
  toggleTaskStatus: (id) => {
    if (!get().currentMeetingId) return
    
    set(state => {
      if (!state.currentMeeting) return state
      
      const updatedTasks = state.currentMeeting.tasks.map(task => {
        if (task.id !== id) return task
        
        // Toggle between Todo, In Progress, and Done
        const nextStatus = task.status === 'Todo' 
          ? 'In Progress' 
          : task.status === 'In Progress' 
            ? 'Done' 
            : 'Todo'
            
        return { ...task, status: nextStatus }
      })
      
      const updatedMeeting = {
        ...state.currentMeeting,
        tasks: updatedTasks
      }
      
      const updatedMeetings = state.meetings.map(meeting => 
        meeting.id === state.currentMeetingId ? updatedMeeting : meeting
      )
      
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeeting: updatedMeeting
      }
    })
  },
  // Transcription actions
  setAssemblyApiKey: (apiKey) => {
    try {
      initializeAssemblyAI(apiKey)
      set({ assemblyApiKey: apiKey })
      
      // Store API key in localStorage for persistence
      localStorage.setItem('assemblyApiKey', apiKey)
    } catch (error) {
      console.error('Error setting AssemblyAI API key:', error)
      throw error
    }
  },
  
  startTranscription: () => {
    set({ isTranscribing: true })
  },
  
  stopTranscription: () => {
    set({ isTranscribing: false })
  },
  
  setTranscriptionStatus: (status) => {
    set({ transcriptionStatus: status })
  },
  
  addTranscriptChunk: (chunk) => {
    if (!get().currentMeetingId) return
    
    const newChunk: TranscriptChunk = {
      ...chunk,
      id: uuidv4()
    }
    
    set(state => {
      if (!state.currentMeeting) return state
      
      const updatedTranscripts = [...state.currentMeeting.transcripts, newChunk]
      
      const updatedMeeting = {
        ...state.currentMeeting,
        transcripts: updatedTranscripts
      }
      
      const updatedMeetings = state.meetings.map(meeting => 
        meeting.id === state.currentMeetingId ? updatedMeeting : meeting
      )
      
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeeting: updatedMeeting
      }
    })
  },
  
  updateTranscripts: (transcripts) => {
    if (!get().currentMeetingId) return
    
    set(state => {
      if (!state.currentMeeting) return state
      
      const updatedMeeting = {
        ...state.currentMeeting,
        transcripts
      }
      
      const updatedMeetings = state.meetings.map(meeting => 
        meeting.id === state.currentMeetingId ? updatedMeeting : meeting
      )
      
      saveMeetingsToStorage(updatedMeetings)
      
      return {
        meetings: updatedMeetings,
        currentMeeting: updatedMeeting
      }
    })
  }
}))