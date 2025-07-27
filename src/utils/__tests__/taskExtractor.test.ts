import { describe, it, expect } from 'vitest'
import {
  isLikelyActionItem,
  extractPotentialTags,
  extractTasksFromNotes,
} from '../taskExtractor'

describe('Task Extractor Utils', () => {
  describe('isLikelyActionItem', () => {
    it('should identify common action item phrases', () => {
      const actionItems = [
        'We need to review the documentation',
        'I should update the database',
        'Must complete the testing by Friday',
        'Will implement the new feature',
        'TODO: Fix the bug in authentication',
        'Action item: Schedule follow-up meeting',
        'Follow up with the client',
        'Remember to send the report',
        'Don\'t forget to backup the data',
        'Make sure to test the integration',
        'Please review the code',
        'Let\'s schedule a meeting',
        'You need to approve the changes',
      ]

      actionItems.forEach(item => {
        expect(isLikelyActionItem(item)).toBe(true)
      })
    })

    it('should not identify non-action items', () => {
      const nonActionItems = [
        'This is just a regular statement',
        'The weather is nice today',
        'We discussed the project timeline',
        'The meeting went well',
        'Everyone agreed on the approach',
        'The system is working properly',
      ]

      nonActionItems.forEach(item => {
        expect(isLikelyActionItem(item)).toBe(false)
      })
    })

    it('should handle empty or null input', () => {
      expect(isLikelyActionItem('')).toBe(false)
      expect(isLikelyActionItem(null as any)).toBe(false)
      expect(isLikelyActionItem(undefined as any)).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(isLikelyActionItem('NEED TO COMPLETE THIS')).toBe(true)
      expect(isLikelyActionItem('Need To Complete This')).toBe(true)
      expect(isLikelyActionItem('need to complete this')).toBe(true)
    })

    it('should handle variations of action phrases', () => {
      const variations = [
        'to-do: complete task',
        'to do: complete task',
        'todo: complete task',
        'action required: review document',
        'follow-up needed',
        'follow up needed',
      ]

      variations.forEach(item => {
        expect(isLikelyActionItem(item)).toBe(true)
      })
    })
  })

  describe('extractPotentialTags', () => {
    it('should extract hashtags from text', () => {
      const text = 'This is about #project and #feature development'
      const tags = extractPotentialTags(text)
      
      expect(tags).toContain('project')
      expect(tags).toContain('feature')
    })

    it('should extract project indicators', () => {
      const text = 'We need to fix this bug in the project'
      const tags = extractPotentialTags(text)
      
      expect(tags).toContain('bug')
      expect(tags).toContain('project')
    })

    it('should remove duplicate tags', () => {
      const text = 'This #project is about project management #project'
      const tags = extractPotentialTags(text)
      
      expect(tags.filter(tag => tag === 'project')).toHaveLength(1)
    })

    it('should handle empty input', () => {
      expect(extractPotentialTags('')).toEqual([])
      expect(extractPotentialTags(null as any)).toEqual([])
      expect(extractPotentialTags(undefined as any)).toEqual([])
    })

    it('should extract multiple types of indicators', () => {
      const text = 'Review the #feature ticket for this epic story'
      const tags = extractPotentialTags(text)
      
      expect(tags).toContain('feature')
      expect(tags).toContain('ticket')
      expect(tags).toContain('epic')
      expect(tags).toContain('story')
    })

    it('should handle text without any tags', () => {
      const text = 'This is just regular text without any indicators'
      const tags = extractPotentialTags(text)
      
      expect(tags).toEqual([])
    })

    it('should extract common development terms', () => {
      const text = 'Need to review the PR and fix the issue'
      const tags = extractPotentialTags(text)
      
      expect(tags).toContain('review')
      expect(tags).toContain('pr')
      expect(tags).toContain('issue')
    })
  })

  describe('extractTasksFromNotes', () => {
    it('should extract tasks from action item text', () => {
      const notesContent = `
# Meeting Notes

We need to review the documentation
- Should update the database schema
- TODO: Fix authentication bug
Action item: Schedule follow-up meeting

Regular discussion about the project timeline.
`

      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks).toHaveLength(4)
      expect(tasks[0].title).toBe('We need to review the documentation')
      expect(tasks[1].title).toBe('Should update the database schema')
      expect(tasks[2].title).toBe('Fix authentication bug')
      expect(tasks[3].title).toBe('Schedule follow-up meeting')
    })

    it('should clean up task titles properly', () => {
      const notesContent = `
- Need to complete testing
* Should review code
1. Must update documentation
TODO: Fix the bug
Action item: Schedule meeting
Task: Complete implementation
`

      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks[0].title).toBe('Need to complete testing')
      expect(tasks[1].title).toBe('Should review code')
      expect(tasks[2].title).toBe('Must update documentation')
      expect(tasks[3].title).toBe('Fix the bug')
      expect(tasks[4].title).toBe('Schedule meeting')
      expect(tasks[5].title).toBe('Complete implementation')
    })

    it('should assign appropriate priorities', () => {
      const notesContent = `
Need to fix this urgent bug
Should complete this later
Must handle this critical issue
Nice to have feature eventually
Regular task to complete
`

      const tasks = extractTasksFromNotes(notesContent)
      
      const urgentTask = tasks.find(t => t.title.includes('urgent'))
      const laterTask = tasks.find(t => t.title.includes('later'))
      const criticalTask = tasks.find(t => t.title.includes('critical'))
      const niceToHaveTask = tasks.find(t => t.title.includes('eventually'))
      const regularTask = tasks.find(t => t.title.includes('Regular'))
      
      expect(urgentTask?.priority).toBe('High')
      expect(laterTask?.priority).toBe('Low')
      expect(criticalTask?.priority).toBe('High')
      expect(niceToHaveTask?.priority).toBe('Low')
      expect(regularTask?.priority).toBe('Medium')
    })

    it('should extract tags from task content', () => {
      const notesContent = `
Need to fix the #authentication bug
Should review the #frontend code
TODO: Update #database schema for #project
`

      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks[0].tags).toContain('authentication')
      expect(tasks[0].tags).toContain('bug')
      expect(tasks[1].tags).toContain('frontend')
      expect(tasks[2].tags).toContain('database')
      expect(tasks[2].tags).toContain('project')
    })

    it('should handle empty notes content', () => {
      expect(extractTasksFromNotes('')).toEqual([])
      expect(extractTasksFromNotes(null as any)).toEqual([])
      expect(extractTasksFromNotes(undefined as any)).toEqual([])
    })

    it('should skip headers and empty lines', () => {
      const notesContent = `
# Main Header
## Sub Header

Need to complete this task

### Another Header

Should do this action item
`

      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks).toHaveLength(2)
      expect(tasks[0].title).toBe('Need to complete this task')
      expect(tasks[1].title).toBe('Should do this action item')
    })

    it('should include description for extracted tasks', () => {
      const notesContent = 'Need to complete the testing'
      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks[0].description).toBe('Extracted from notes')
    })

    it('should handle notes with no action items', () => {
      const notesContent = `
# Meeting Notes

We discussed the project timeline.
Everyone agreed on the approach.
The system is working well.
`

      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks).toEqual([])
    })

    it('should handle mixed content with some action items', () => {
      const notesContent = `
# Meeting Notes

We discussed the project timeline.
Need to review the documentation.
Everyone agreed on the approach.
Should update the database.
The system is working well.
`

      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks).toHaveLength(2)
      expect(tasks[0].title).toBe('Need to review the documentation.')
      expect(tasks[1].title).toBe('Should update the database.')
    })

    it('should handle various bullet point formats', () => {
      const notesContent = `
- Need to complete task A
* Should finish task B
• Must do task C
→ Will handle task D
`

      const tasks = extractTasksFromNotes(notesContent)
      
      expect(tasks).toHaveLength(4)
      expect(tasks[0].title).toBe('Need to complete task A')
      expect(tasks[1].title).toBe('Should finish task B')
      expect(tasks[2].title).toBe('Must do task C')
      expect(tasks[3].title).toBe('Will handle task D')
    })
  })
})