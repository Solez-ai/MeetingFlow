/**
 * Optimized store hooks to minimize re-renders
 */

import { useMemo } from 'react'
import { useMeetingStore } from '@/store/meetingStore'
import { performanceMonitor } from '@/utils/performance'

// Optimized hook for current meeting data
export function useCurrentMeeting() {
  return useMeetingStore((state) => ({
    currentMeeting: state.currentMeeting,
    currentMeetingId: state.currentMeetingId,
  }))
}

// Optimized hook for meetings list
export function useMeetingsList() {
  return useMeetingStore((state) => state.meetings)
}

// Optimized hook for agenda data
export function useAgenda() {
  return useMeetingStore((state) => state.currentMeeting?.agenda || [])
}

// Optimized hook for tasks data
export function useTasks() {
  return useMeetingStore((state) => state.currentMeeting?.tasks || [])
}

// Optimized hook for notes data
export function useNotes() {
  return useMeetingStore((state) => state.currentMeeting?.notes || [])
}

// Optimized hook for transcription data
export function useTranscription() {
  return useMeetingStore((state) => ({
    transcripts: state.currentMeeting?.transcripts || [],
    isTranscribing: state.isTranscribing,
    transcriptionStatus: state.transcriptionStatus,
  }))
}

// Optimized hook for meeting actions
export function useMeetingActions() {
  return useMeetingStore((state) => ({
    createMeeting: state.createMeeting,
    updateMeeting: state.updateMeeting,
    deleteMeeting: state.deleteMeeting,
    setCurrentMeeting: state.setCurrentMeeting,
  }))
}

// Optimized hook for agenda actions
export function useAgendaActions() {
  return useMeetingStore((state) => ({
    addAgendaItem: state.addAgendaItem,
    updateAgendaItem: state.updateAgendaItem,
    removeAgendaItem: state.removeAgendaItem,
    reorderAgendaItems: state.reorderAgendaItems,
    generateTimeBalancedAgenda: state.generateTimeBalancedAgenda,
  }))
}

// Optimized hook for task actions
export function useTaskActions() {
  return useMeetingStore((state) => ({
    addTask: state.addTask,
    updateTask: state.updateTask,
    removeTask: state.removeTask,
    toggleTaskStatus: state.toggleTaskStatus,
  }))
}

// Optimized hook for transcription actions
export function useTranscriptionActions() {
  return useMeetingStore((state) => ({
    setAssemblyApiKey: state.setAssemblyApiKey,
    startTranscription: state.startTranscription,
    stopTranscription: state.stopTranscription,
    addTranscriptChunk: state.addTranscriptChunk,
    updateTranscripts: state.updateTranscripts,
  }))
}

// Memoized selectors for complex computations
export function useTaskStats() {
  return useMeetingStore((state) => {
    const tasks = state.currentMeeting?.tasks || []
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'Todo').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      done: tasks.filter(t => t.status === 'Done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length,
    }
  })
}

export function useAgendaStats() {
  return useMeetingStore((state) => {
    const agenda = state.currentMeeting?.agenda || []
    const totalDuration = agenda.reduce((sum, item) => sum + (item.duration || 0), 0)
    return {
      totalItems: agenda.length,
      totalDuration,
      averageDuration: agenda.length > 0 ? totalDuration / agenda.length : 0,
    }
  })
}

// Hook for filtered and sorted data
export function useFilteredTasks(filter: 'all' | 'todo' | 'in-progress' | 'done' = 'all') {
  return useMeetingStore((state) => {
    const tasks = state.currentMeeting?.tasks || []
    
    switch (filter) {
      case 'todo':
        return tasks.filter(t => t.status === 'Todo')
      case 'in-progress':
        return tasks.filter(t => t.status === 'In Progress')
      case 'done':
        return tasks.filter(t => t.status === 'Done')
      default:
        return tasks
    }
  })
}

export function useSortedMeetings(sortBy: 'date' | 'title' = 'date', order: 'asc' | 'desc' = 'desc') {
  return useMeetingStore((state) => {
    const meetings = [...state.meetings]
    
    meetings.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'date') {
        comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      } else {
        comparison = a.title.localeCompare(b.title)
      }
      
      return order === 'asc' ? comparison : -comparison
    })
    
    return meetings
  })
}

// Performance monitoring hook
export function useStorePerformance() {
  const renderCounts = useMemo(() => {
    return {
      currentMeeting: performanceMonitor.getComponentRenderCount('useCurrentMeeting'),
      meetingsList: performanceMonitor.getComponentRenderCount('useMeetingsList'),
      agenda: performanceMonitor.getComponentRenderCount('useAgenda'),
      tasks: performanceMonitor.getComponentRenderCount('useTasks'),
      notes: performanceMonitor.getComponentRenderCount('useNotes'),
      transcription: performanceMonitor.getComponentRenderCount('useTranscription'),
    }
  }, [])

  return {
    renderCounts,
    totalRenders: Object.values(renderCounts).reduce((sum, count) => sum + count, 0),
  }
}