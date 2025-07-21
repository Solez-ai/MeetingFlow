/**
 * Meeting store using Zustand
 * 
 * This store manages the current meeting state, including agenda,
 * notes, tasks, and transcripts.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Meeting, AgendaItem, NoteBlock, Task, TranscriptChunk } from '@/types'
import { STORAGE_KEYS, saveMeeting, loadMeeting, deleteMeeting, loadFromStorage } from '@/utils/storage'

interface MeetingState {
  // Current meeting data
  currentMeeting: Meeting | null
  
  // Meeting list
  meetings: {
    id: string
    title: string
    startTime: string
    lastModified: string
  }[]
  
  // Actions
  createMeeting: (title: string, duration?: number) => Meeting
  loadMeeting: (id: string) => Meeting | null
  updateMeeting: (meeting: Partial<Meeting>) => boolean
  deleteMeeting: (id: string) => boolean
  
  // Agenda actions
  addAgendaItem: (item: Omit<AgendaItem, 'id' | 'order'>) => string
  updateAgendaItem: (id: string, updates: Partial<Omit<AgendaItem, 'id'>>) => boolean
  removeAgendaItem: (id: string) => boolean
  reorderAgendaItems: (itemIds: string[]) => boolean
  generateTimeBalancedAgenda: (totalDuration: number) => boolean
  
  // Notes actions
  addNoteBlock: (block: Omit<NoteBlock, 'id' | 'timestamp'>) => string
  updateNoteBlock: (id: string, updates: Partial<Omit<NoteBlock, 'id'>>) => boolean
  removeNoteBlock: (id: string) => boolean
  linkNoteToAgenda: (noteId: string, agendaItemId: string) => boolean
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'created'>) => string
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => boolean
  removeTask: (id: string) => boolean
  toggleTaskStatus: (id: string) => boolean
  
  // Transcript actions
  addTranscriptChunk: (chunk: Omit<TranscriptChunk, 'id'>) => string
  updateTranscriptChunk: (id: string, updates: Partial<Omit<TranscriptChunk, 'id'>>) => boolean
  removeTranscriptChunk: (id: string) => boolean
  extractTasksFromTranscript: (chunkId: string) => string[]
  
  // Meeting lifecycle
  startMeeting: () => boolean
  endMeeting: () => boolean
  saveMeetingToStorage: () => boolean
  
  // Initialization
  initializeMeetings: () => void
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentMeeting: null,
      meetings: [],
      
      // Meeting CRUD operations
      createMeeting: (title: string, duration = 60) => {
        const meeting: Meeting = {
          id: uuidv4(),
          title,
          startTime: new Date().toISOString(),
          agenda: [],
          notes: [],
          tasks: [],
          transcripts: [],
          metadata: {
            duration,
            participants: [],
            tags: []
          }
        }
        
        set((state) => ({
          currentMeeting: meeting,
          meetings: [
            ...state.meetings,
            {
              id: meeting.id,
              title: meeting.title,
              startTime: meeting.startTime,
              lastModified: new Date().toISOString()
            }
          ]
        }))
        
        // Save to localStorage
        saveMeeting(meeting)
        
        return meeting
      },
      
      loadMeeting: (id: string) => {
        const meeting = loadMeeting(id)
        if (meeting) {
          set({ currentMeeting: meeting })
        }
        return meeting
      },
      
      updateMeeting: (updates: Partial<Meeting>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = { ...currentMeeting, ...updates }
        
        set((state) => ({
          currentMeeting: updatedMeeting,
          meetings: state.meetings.map(m => 
            m.id === updatedMeeting.id 
              ? { ...m, title: updatedMeeting.title, lastModified: new Date().toISOString() }
              : m
          )
        }))
        
        return saveMeeting(updatedMeeting)
      },
      
      deleteMeeting: (id: string) => {
        const success = deleteMeeting(id)
        if (success) {
          set((state) => ({
            meetings: state.meetings.filter(m => m.id !== id),
            currentMeeting: state.currentMeeting?.id === id ? null : state.currentMeeting
          }))
        }
        return success
      },
      
      // Agenda operations
      addAgendaItem: (item: Omit<AgendaItem, 'id' | 'order'>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return ''
        
        const id = uuidv4()
        const newItem: AgendaItem = {
          ...item,
          id,
          order: currentMeeting.agenda.length
        }
        
        const updatedMeeting = {
          ...currentMeeting,
          agenda: [...currentMeeting.agenda, newItem]
        }
        
        set({ currentMeeting: updatedMeeting })
        saveMeeting(updatedMeeting)
        
        return id
      },
      
      updateAgendaItem: (id: string, updates: Partial<Omit<AgendaItem, 'id'>>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          agenda: currentMeeting.agenda.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      removeAgendaItem: (id: string) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          agenda: currentMeeting.agenda
            .filter(item => item.id !== id)
            .map((item, index) => ({ ...item, order: index }))
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      reorderAgendaItems: (itemIds: string[]) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const reorderedAgenda = itemIds
          .map(id => currentMeeting.agenda.find(item => item.id === id))
          .filter((item): item is AgendaItem => item !== undefined)
          .map((item, index) => ({ ...item, order: index }))
        
        const updatedMeeting = {
          ...currentMeeting,
          agenda: reorderedAgenda
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      generateTimeBalancedAgenda: (totalDuration: number) => {
        const { currentMeeting } = get()
        if (!currentMeeting || currentMeeting.agenda.length === 0) return false
        
        const itemCount = currentMeeting.agenda.length
        const timePerItem = Math.floor(totalDuration / itemCount)
        const remainder = totalDuration % itemCount
        
        const updatedAgenda = currentMeeting.agenda.map((item, index) => ({
          ...item,
          duration: timePerItem + (index < remainder ? 1 : 0)
        }))
        
        const updatedMeeting = {
          ...currentMeeting,
          agenda: updatedAgenda,
          metadata: {
            ...currentMeeting.metadata,
            duration: totalDuration
          }
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      // Notes operations
      addNoteBlock: (block: Omit<NoteBlock, 'id' | 'timestamp'>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return ''
        
        const id = uuidv4()
        const newBlock: NoteBlock = {
          ...block,
          id,
          timestamp: new Date().toISOString()
        }
        
        const updatedMeeting = {
          ...currentMeeting,
          notes: [...currentMeeting.notes, newBlock]
        }
        
        set({ currentMeeting: updatedMeeting })
        saveMeeting(updatedMeeting)
        
        return id
      },
      
      updateNoteBlock: (id: string, updates: Partial<Omit<NoteBlock, 'id'>>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          notes: currentMeeting.notes.map(note =>
            note.id === id ? { ...note, ...updates } : note
          )
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      removeNoteBlock: (id: string) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          notes: currentMeeting.notes.filter(note => note.id !== id)
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      linkNoteToAgenda: (noteId: string, agendaItemId: string) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          notes: currentMeeting.notes.map(note =>
            note.id === noteId ? { ...note, linkedToAgendaItem: agendaItemId } : note
          )
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      // Task operations
      addTask: (task: Omit<Task, 'id' | 'created'>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return ''
        
        const id = uuidv4()
        const newTask: Task = {
          ...task,
          id,
          created: new Date().toISOString()
        }
        
        const updatedMeeting = {
          ...currentMeeting,
          tasks: [...currentMeeting.tasks, newTask]
        }
        
        set({ currentMeeting: updatedMeeting })
        saveMeeting(updatedMeeting)
        
        return id
      },
      
      updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          tasks: currentMeeting.tasks.map(task =>
            task.id === id 
              ? { ...task, ...updates, updated: new Date().toISOString() }
              : task
          )
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      removeTask: (id: string) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          tasks: currentMeeting.tasks.filter(task => task.id !== id)
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      toggleTaskStatus: (id: string) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const task = currentMeeting.tasks.find(t => t.id === id)
        if (!task) return false
        
        const nextStatus = task.status === 'Todo' 
          ? 'In Progress' 
          : task.status === 'In Progress' 
            ? 'Done' 
            : 'Todo'
        
        return get().updateTask(id, { status: nextStatus })
      },
      
      // Transcript operations
      addTranscriptChunk: (chunk: Omit<TranscriptChunk, 'id'>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return ''
        
        const id = uuidv4()
        const newChunk: TranscriptChunk = {
          ...chunk,
          id
        }
        
        const updatedMeeting = {
          ...currentMeeting,
          transcripts: [...currentMeeting.transcripts, newChunk]
        }
        
        set({ currentMeeting: updatedMeeting })
        saveMeeting(updatedMeeting)
        
        return id
      },
      
      updateTranscriptChunk: (id: string, updates: Partial<Omit<TranscriptChunk, 'id'>>) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          transcripts: currentMeeting.transcripts.map(chunk =>
            chunk.id === id ? { ...chunk, ...updates } : chunk
          )
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      removeTranscriptChunk: (id: string) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          transcripts: currentMeeting.transcripts.filter(chunk => chunk.id !== id)
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      extractTasksFromTranscript: (chunkId: string) => {
        const { currentMeeting } = get()
        if (!currentMeeting) return []
        
        const chunk = currentMeeting.transcripts.find(c => c.id === chunkId)
        if (!chunk || !chunk.actionItems) return []
        
        const taskIds: string[] = []
        
        chunk.actionItems.forEach(actionItem => {
          const taskId = get().addTask({
            title: actionItem,
            priority: 'Medium',
            status: 'Todo',
            tags: ['transcript'],
            createdFrom: 'transcript'
          })
          
          if (taskId) {
            taskIds.push(taskId)
          }
        })
        
        return taskIds
      },
      
      // Meeting lifecycle
      startMeeting: () => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const updatedMeeting = {
          ...currentMeeting,
          startTime: new Date().toISOString()
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      endMeeting: () => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        const endTime = new Date().toISOString()
        const startTime = new Date(currentMeeting.startTime)
        const duration = Math.round((new Date(endTime).getTime() - startTime.getTime()) / 60000)
        
        const updatedMeeting = {
          ...currentMeeting,
          endTime,
          metadata: {
            ...currentMeeting.metadata,
            duration
          }
        }
        
        set({ currentMeeting: updatedMeeting })
        return saveMeeting(updatedMeeting)
      },
      
      saveMeetingToStorage: () => {
        const { currentMeeting } = get()
        if (!currentMeeting) return false
        
        return saveMeeting(currentMeeting)
      },
      
      // Initialization
      initializeMeetings: () => {
        // Load meetings list from localStorage
        const storedMeetings = loadFromStorage<Meeting[]>(STORAGE_KEYS.MEETINGS, [])
        
        // Convert to meeting summary format
        const meetingSummaries = storedMeetings.map(meeting => ({
          id: meeting.id,
          title: meeting.title,
          startTime: meeting.startTime,
          lastModified: meeting.endTime || meeting.startTime
        }))
        
        set({ meetings: meetingSummaries })
      }
    }),
    {
      name: STORAGE_KEYS.CURRENT_MEETING,
      partialize: (state) => ({ 
        currentMeeting: state.currentMeeting,
        meetings: state.meetings 
      })
    }
  )
)