/**
 * Validation utilities for data integrity
 * 
 * This module provides schema validation for meeting data structures
 * to ensure data integrity before storage and after retrieval.
 */

import { Meeting, AgendaItem, NoteBlock, Task, TranscriptChunk } from '@/types'

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate a meeting object against expected schema
 */
export function validateMeeting(meeting: unknown): ValidationResult {
  const errors: string[] = []
  
  // Type guard check
  if (!meeting || typeof meeting !== 'object') {
    return { valid: false, errors: ['Meeting must be an object'] }
  }
  
  const meetingObj = meeting as Partial<Meeting>
  
  // Required fields
  if (!meetingObj.id) errors.push('Meeting ID is required')
  if (!meetingObj.title) errors.push('Meeting title is required')
  if (!meetingObj.startTime) errors.push('Meeting start time is required')
  
  // Array fields with validation
  if (Array.isArray(meetingObj.agenda)) {
    meetingObj.agenda.forEach((item, index) => {
      const agendaResult = validateAgendaItem(item)
      if (!agendaResult.valid) {
        errors.push(`Agenda item at index ${index} is invalid: ${agendaResult.errors.join(', ')}`)
      }
    })
  } else if (meetingObj.agenda !== undefined) {
    errors.push('Agenda must be an array')
  }
  
  if (Array.isArray(meetingObj.notes)) {
    meetingObj.notes.forEach((note, index) => {
      const noteResult = validateNoteBlock(note)
      if (!noteResult.valid) {
        errors.push(`Note block at index ${index} is invalid: ${noteResult.errors.join(', ')}`)
      }
    })
  } else if (meetingObj.notes !== undefined) {
    errors.push('Notes must be an array')
  }
  
  if (Array.isArray(meetingObj.tasks)) {
    meetingObj.tasks.forEach((task, index) => {
      const taskResult = validateTask(task)
      if (!taskResult.valid) {
        errors.push(`Task at index ${index} is invalid: ${taskResult.errors.join(', ')}`)
      }
    })
  } else if (meetingObj.tasks !== undefined) {
    errors.push('Tasks must be an array')
  }
  
  if (Array.isArray(meetingObj.transcripts)) {
    meetingObj.transcripts.forEach((transcript, index) => {
      const transcriptResult = validateTranscriptChunk(transcript)
      if (!transcriptResult.valid) {
        errors.push(`Transcript chunk at index ${index} is invalid: ${transcriptResult.errors.join(', ')}`)
      }
    })
  } else if (meetingObj.transcripts !== undefined) {
    errors.push('Transcripts must be an array')
  }
  
  // Metadata validation if present
  if (meetingObj.metadata) {
    if (typeof meetingObj.metadata !== 'object') {
      errors.push('Metadata must be an object')
    } else {
      const metadata = meetingObj.metadata as Record<string, unknown>
      
      if (metadata.duration !== undefined && typeof metadata.duration !== 'number') {
        errors.push('Metadata duration must be a number')
      }
      
      if (metadata.participants !== undefined && !Array.isArray(metadata.participants)) {
        errors.push('Metadata participants must be an array')
      }
      
      if (metadata.tags !== undefined && !Array.isArray(metadata.tags)) {
        errors.push('Metadata tags must be an array')
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate an agenda item
 */
export function validateAgendaItem(item: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!item || typeof item !== 'object') {
    return { valid: false, errors: ['Agenda item must be an object'] }
  }
  
  const agendaItem = item as Partial<AgendaItem>
  
  if (!agendaItem.id) errors.push('Agenda item ID is required')
  if (!agendaItem.title) errors.push('Agenda item title is required')
  if (typeof agendaItem.duration !== 'number') errors.push('Agenda item duration must be a number')
  if (typeof agendaItem.order !== 'number') errors.push('Agenda item order must be a number')
  
  if (agendaItem.description !== undefined && typeof agendaItem.description !== 'string') {
    errors.push('Agenda item description must be a string')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate a note block
 */
export function validateNoteBlock(note: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!note || typeof note !== 'object') {
    return { valid: false, errors: ['Note block must be an object'] }
  }
  
  const noteBlock = note as Partial<NoteBlock>
  
  if (!noteBlock.id) errors.push('Note block ID is required')
  if (!noteBlock.content) errors.push('Note block content is required')
  if (!noteBlock.timestamp) errors.push('Note block timestamp is required')
  
  const validTypes = ['heading', 'paragraph', 'bullet', 'todo', 'code', 'quote']
  if (!noteBlock.type || !validTypes.includes(noteBlock.type)) {
    errors.push(`Note block type must be one of: ${validTypes.join(', ')}`)
  }
  
  if (noteBlock.linkedToAgendaItem !== undefined && typeof noteBlock.linkedToAgendaItem !== 'string') {
    errors.push('Note block linkedToAgendaItem must be a string')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate a task
 */
export function validateTask(task: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!task || typeof task !== 'object') {
    return { valid: false, errors: ['Task must be an object'] }
  }
  
  const taskObj = task as Partial<Task>
  
  if (!taskObj.id) errors.push('Task ID is required')
  if (!taskObj.title) errors.push('Task title is required')
  if (!taskObj.created) errors.push('Task created timestamp is required')
  
  const validPriorities = ['Low', 'Medium', 'High']
  if (!taskObj.priority || !validPriorities.includes(taskObj.priority)) {
    errors.push(`Task priority must be one of: ${validPriorities.join(', ')}`)
  }
  
  const validStatuses = ['Todo', 'In Progress', 'Done']
  if (!taskObj.status || !validStatuses.includes(taskObj.status)) {
    errors.push(`Task status must be one of: ${validStatuses.join(', ')}`)
  }
  
  if (!Array.isArray(taskObj.tags)) {
    errors.push('Task tags must be an array')
  }
  
  if (taskObj.description !== undefined && typeof taskObj.description !== 'string') {
    errors.push('Task description must be a string')
  }
  
  if (taskObj.dueDate !== undefined && typeof taskObj.dueDate !== 'string') {
    errors.push('Task dueDate must be a string')
  }
  
  if (taskObj.assignee !== undefined && typeof taskObj.assignee !== 'string') {
    errors.push('Task assignee must be a string')
  }
  
  const validCreatedFrom = ['manual', 'transcript', 'notes']
  if (taskObj.createdFrom !== undefined && !validCreatedFrom.includes(taskObj.createdFrom)) {
    errors.push(`Task createdFrom must be one of: ${validCreatedFrom.join(', ')}`)
  }
  
  if (taskObj.updated !== undefined && typeof taskObj.updated !== 'string') {
    errors.push('Task updated timestamp must be a string')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate a transcript chunk
 */
export function validateTranscriptChunk(chunk: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!chunk || typeof chunk !== 'object') {
    return { valid: false, errors: ['Transcript chunk must be an object'] }
  }
  
  const transcriptChunk = chunk as Partial<TranscriptChunk>
  
  if (!transcriptChunk.id) errors.push('Transcript chunk ID is required')
  if (!transcriptChunk.text) errors.push('Transcript chunk text is required')
  if (typeof transcriptChunk.timestamp !== 'number') errors.push('Transcript chunk timestamp must be a number')
  if (typeof transcriptChunk.confidence !== 'number') errors.push('Transcript chunk confidence must be a number')
  
  if (transcriptChunk.speaker !== undefined && typeof transcriptChunk.speaker !== 'string') {
    errors.push('Transcript chunk speaker must be a string')
  }
  
  if (transcriptChunk.actionItems !== undefined && !Array.isArray(transcriptChunk.actionItems)) {
    errors.push('Transcript chunk actionItems must be an array')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}