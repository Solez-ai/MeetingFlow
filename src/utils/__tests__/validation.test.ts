import { describe, it, expect } from 'vitest'
import {
  validateMeeting,
  validateAgendaItem,
  validateNoteBlock,
  validateTask,
  validateTranscriptChunk,
} from '../validation'
import { mockMeeting, mockAgendaItems, mockNoteBlocks, mockTasks, mockTranscriptChunks } from '../../test/fixtures'

describe('Validation Utils', () => {
  describe('validateMeeting', () => {
    it('should validate a correct meeting object', () => {
      const result = validateMeeting(mockMeeting)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-object input', () => {
      const result = validateMeeting('not an object')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Meeting must be an object')
    })

    it('should reject meeting without required fields', () => {
      const invalidMeeting = {
        // Missing id, title, startTime
        agenda: [],
        notes: [],
        tasks: [],
        transcripts: [],
      }

      const result = validateMeeting(invalidMeeting)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Meeting ID is required')
      expect(result.errors).toContain('Meeting title is required')
      expect(result.errors).toContain('Meeting start time is required')
    })

    it('should validate agenda items', () => {
      const meetingWithInvalidAgenda = {
        ...mockMeeting,
        agenda: [{ id: '', title: '', duration: 'invalid', order: 'invalid' }],
      }

      const result = validateMeeting(meetingWithInvalidAgenda)

      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('Agenda item at index 0 is invalid'))).toBe(true)
    })

    it('should validate note blocks', () => {
      const meetingWithInvalidNotes = {
        ...mockMeeting,
        notes: [{ id: '', content: '', type: 'invalid', timestamp: '' }],
      }

      const result = validateMeeting(meetingWithInvalidNotes)

      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('Note block at index 0 is invalid'))).toBe(true)
    })

    it('should validate tasks', () => {
      const meetingWithInvalidTasks = {
        ...mockMeeting,
        tasks: [{ id: '', title: '', priority: 'invalid', status: 'invalid', tags: 'not-array', created: '' }],
      }

      const result = validateMeeting(meetingWithInvalidTasks)

      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('Task at index 0 is invalid'))).toBe(true)
    })

    it('should validate transcript chunks', () => {
      const meetingWithInvalidTranscripts = {
        ...mockMeeting,
        transcripts: [{ id: '', text: '', timestamp: 'invalid', confidence: 'invalid' }],
      }

      const result = validateMeeting(meetingWithInvalidTranscripts)

      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('Transcript chunk at index 0 is invalid'))).toBe(true)
    })

    it('should validate metadata when present', () => {
      const meetingWithInvalidMetadata = {
        ...mockMeeting,
        metadata: {
          duration: 'invalid',
          participants: 'not-array',
          tags: 'not-array',
        },
      }

      const result = validateMeeting(meetingWithInvalidMetadata)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Metadata duration must be a number')
      expect(result.errors).toContain('Metadata participants must be an array')
      expect(result.errors).toContain('Metadata tags must be an array')
    })

    it('should reject non-array fields', () => {
      const meetingWithInvalidArrays = {
        ...mockMeeting,
        agenda: 'not-array',
        notes: 'not-array',
        tasks: 'not-array',
        transcripts: 'not-array',
      }

      const result = validateMeeting(meetingWithInvalidArrays)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Agenda must be an array')
      expect(result.errors).toContain('Notes must be an array')
      expect(result.errors).toContain('Tasks must be an array')
      expect(result.errors).toContain('Transcripts must be an array')
    })
  })

  describe('validateAgendaItem', () => {
    it('should validate a correct agenda item', () => {
      const result = validateAgendaItem(mockAgendaItems[0])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-object input', () => {
      const result = validateAgendaItem('not an object')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Agenda item must be an object')
    })

    it('should reject agenda item without required fields', () => {
      const invalidItem = {
        // Missing id, title, duration, order
        description: 'Optional description',
      }

      const result = validateAgendaItem(invalidItem)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Agenda item ID is required')
      expect(result.errors).toContain('Agenda item title is required')
      expect(result.errors).toContain('Agenda item duration must be a number')
      expect(result.errors).toContain('Agenda item order must be a number')
    })

    it('should validate optional description field', () => {
      const itemWithInvalidDescription = {
        id: '1',
        title: 'Test',
        duration: 10,
        order: 0,
        description: 123, // Should be string
      }

      const result = validateAgendaItem(itemWithInvalidDescription)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Agenda item description must be a string')
    })
  })

  describe('validateNoteBlock', () => {
    it('should validate a correct note block', () => {
      const result = validateNoteBlock(mockNoteBlocks[0])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-object input', () => {
      const result = validateNoteBlock('not an object')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Note block must be an object')
    })

    it('should reject note block without required fields', () => {
      const invalidNote = {
        // Missing id, content, timestamp, type
        linkedToAgendaItem: 'optional-field',
      }

      const result = validateNoteBlock(invalidNote)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Note block ID is required')
      expect(result.errors).toContain('Note block content is required')
      expect(result.errors).toContain('Note block timestamp is required')
    })

    it('should validate note block type', () => {
      const noteWithInvalidType = {
        id: '1',
        content: 'Test content',
        timestamp: '2024-01-15T10:00:00Z',
        type: 'invalid-type',
      }

      const result = validateNoteBlock(noteWithInvalidType)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Note block type must be one of: heading, paragraph, bullet, todo, code, quote')
    })

    it('should validate optional linkedToAgendaItem field', () => {
      const noteWithInvalidLink = {
        id: '1',
        content: 'Test content',
        timestamp: '2024-01-15T10:00:00Z',
        type: 'paragraph',
        linkedToAgendaItem: 123, // Should be string
      }

      const result = validateNoteBlock(noteWithInvalidLink)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Note block linkedToAgendaItem must be a string')
    })
  })

  describe('validateTask', () => {
    it('should validate a correct task', () => {
      const result = validateTask(mockTasks[0])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-object input', () => {
      const result = validateTask('not an object')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Task must be an object')
    })

    it('should reject task without required fields', () => {
      const invalidTask = {
        // Missing id, title, created, priority, status, tags
        description: 'Optional description',
      }

      const result = validateTask(invalidTask)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Task ID is required')
      expect(result.errors).toContain('Task title is required')
      expect(result.errors).toContain('Task created timestamp is required')
    })

    it('should validate task priority', () => {
      const taskWithInvalidPriority = {
        id: '1',
        title: 'Test Task',
        created: '2024-01-15T10:00:00Z',
        priority: 'Invalid',
        status: 'Todo',
        tags: [],
      }

      const result = validateTask(taskWithInvalidPriority)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Task priority must be one of: Low, Medium, High')
    })

    it('should validate task status', () => {
      const taskWithInvalidStatus = {
        id: '1',
        title: 'Test Task',
        created: '2024-01-15T10:00:00Z',
        priority: 'High',
        status: 'Invalid',
        tags: [],
      }

      const result = validateTask(taskWithInvalidStatus)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Task status must be one of: Todo, In Progress, Done')
    })

    it('should validate task tags as array', () => {
      const taskWithInvalidTags = {
        id: '1',
        title: 'Test Task',
        created: '2024-01-15T10:00:00Z',
        priority: 'High',
        status: 'Todo',
        tags: 'not-array',
      }

      const result = validateTask(taskWithInvalidTags)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Task tags must be an array')
    })

    it('should validate optional fields', () => {
      const taskWithInvalidOptionalFields = {
        id: '1',
        title: 'Test Task',
        created: '2024-01-15T10:00:00Z',
        priority: 'High',
        status: 'Todo',
        tags: [],
        description: 123, // Should be string
        dueDate: 123, // Should be string
        assignee: 123, // Should be string
        createdFrom: 'invalid', // Should be valid enum
        updated: 123, // Should be string
      }

      const result = validateTask(taskWithInvalidOptionalFields)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Task description must be a string')
      expect(result.errors).toContain('Task dueDate must be a string')
      expect(result.errors).toContain('Task assignee must be a string')
      expect(result.errors).toContain('Task createdFrom must be one of: manual, transcript, notes')
      expect(result.errors).toContain('Task updated timestamp must be a string')
    })
  })

  describe('validateTranscriptChunk', () => {
    it('should validate a correct transcript chunk', () => {
      const result = validateTranscriptChunk(mockTranscriptChunks[0])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-object input', () => {
      const result = validateTranscriptChunk('not an object')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Transcript chunk must be an object')
    })

    it('should reject transcript chunk without required fields', () => {
      const invalidChunk = {
        // Missing id, text, timestamp, confidence
        speaker: 'Optional speaker',
      }

      const result = validateTranscriptChunk(invalidChunk)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Transcript chunk ID is required')
      expect(result.errors).toContain('Transcript chunk text is required')
      expect(result.errors).toContain('Transcript chunk timestamp must be a number')
      expect(result.errors).toContain('Transcript chunk confidence must be a number')
    })

    it('should validate optional fields', () => {
      const chunkWithInvalidOptionalFields = {
        id: '1',
        text: 'Test transcript',
        timestamp: 1642248000000,
        confidence: 0.95,
        speaker: 123, // Should be string
        actionItems: 'not-array', // Should be array
      }

      const result = validateTranscriptChunk(chunkWithInvalidOptionalFields)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Transcript chunk speaker must be a string')
      expect(result.errors).toContain('Transcript chunk actionItems must be an array')
    })
  })
})