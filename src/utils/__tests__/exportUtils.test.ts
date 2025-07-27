import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  encodeSessionData,
  decodeSessionData,
  formatAgendaAsMarkdown,
  formatNotesAsMarkdown,
  formatTasksAsMarkdown,
  formatTranscriptsAsMarkdown,
  exportToMarkdown,
  generateShareableLink,
  parseShareableLinkData,
  downloadFile,
  downloadMarkdown,
  copyToClipboard,
} from '../exportUtils'
import { mockMeeting, mockAgendaItems, mockNoteBlocks, mockTasks, mockTranscriptChunks } from '../../test/fixtures'

// Mock DOM APIs
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn(() => 'mock-url')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  // Mock document methods
  vi.stubGlobal('document', {
    createElement: mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    }),
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
  })

  // Mock URL methods
  vi.stubGlobal('URL', {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  })

  // Mock window.location
  vi.stubGlobal('window', {
    location: {
      origin: 'https://example.com',
      pathname: '/meeting',
      search: '',
    },
  })

  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Export Utils', () => {
  describe('Session Data Encoding/Decoding', () => {
    it('should encode session data correctly', () => {
      const encoded = encodeSessionData(mockMeeting)
      expect(encoded).toBeTruthy()
      expect(typeof encoded).toBe('string')
    })

    it('should decode session data correctly', () => {
      const encoded = encodeSessionData(mockMeeting)
      const decoded = decodeSessionData(encoded)
      expect(decoded).toEqual(mockMeeting)
    })

    it('should handle encoding errors', () => {
      const invalidMeeting = { circular: {} } as any
      invalidMeeting.circular.ref = invalidMeeting
      
      expect(() => encodeSessionData(invalidMeeting)).toThrow('Failed to encode session data')
    })

    it('should handle decoding errors', () => {
      expect(() => decodeSessionData('invalid-base64')).toThrow('Invalid session data')
    })
  })

  describe('Markdown Formatting', () => {
    describe('formatAgendaAsMarkdown', () => {
      it('should format agenda items correctly', () => {
        const markdown = formatAgendaAsMarkdown(mockAgendaItems)
        
        expect(markdown).toContain('## Agenda')
        expect(markdown).toContain('1. **Project Overview** (15 min)')
        expect(markdown).toContain('Discuss project goals and timeline')
        expect(markdown).toContain('2. **Technical Discussion** (20 min)')
        expect(markdown).toContain('3. **Next Steps** (10 min)')
      })

      it('should handle empty agenda', () => {
        const markdown = formatAgendaAsMarkdown([])
        expect(markdown).toContain('## Agenda')
        expect(markdown).toContain('No agenda items.')
      })

      it('should handle agenda items without description', () => {
        const itemsWithoutDesc = [{ ...mockAgendaItems[0], description: undefined }]
        const markdown = formatAgendaAsMarkdown(itemsWithoutDesc)
        
        expect(markdown).toContain('1. **Project Overview** (15 min)')
        expect(markdown).not.toContain('undefined')
      })
    })

    describe('formatNotesAsMarkdown', () => {
      it('should format different note types correctly', () => {
        const markdown = formatNotesAsMarkdown(mockNoteBlocks)
        
        expect(markdown).toContain('## Notes')
        expect(markdown).toContain('### Meeting Notes') // heading
        expect(markdown).toContain('This is a sample note block') // paragraph
        expect(markdown).toContain('- [ ] Complete the project documentation') // todo
      })

      it('should handle empty notes', () => {
        const markdown = formatNotesAsMarkdown([])
        expect(markdown).toContain('## Notes')
        expect(markdown).toContain('No notes taken.')
      })

      it('should format code blocks correctly', () => {
        const codeNote = {
          id: '1',
          type: 'code' as const,
          content: 'console.log("hello")',
          timestamp: '2024-01-15T10:00:00Z',
        }
        const markdown = formatNotesAsMarkdown([codeNote])
        
        expect(markdown).toContain('```')
        expect(markdown).toContain('console.log("hello")')
      })

      it('should format quotes correctly', () => {
        const quoteNote = {
          id: '1',
          type: 'quote' as const,
          content: 'This is a quote',
          timestamp: '2024-01-15T10:00:00Z',
        }
        const markdown = formatNotesAsMarkdown([quoteNote])
        
        expect(markdown).toContain('> This is a quote')
      })

      it('should format bullet points correctly', () => {
        const bulletNote = {
          id: '1',
          type: 'bullet' as const,
          content: 'Bullet point item',
          timestamp: '2024-01-15T10:00:00Z',
        }
        const markdown = formatNotesAsMarkdown([bulletNote])
        
        expect(markdown).toContain('- Bullet point item')
      })
    })

    describe('formatTasksAsMarkdown', () => {
      it('should format tasks by status correctly', () => {
        const markdown = formatTasksAsMarkdown(mockTasks)
        
        expect(markdown).toContain('## Tasks')
        expect(markdown).toContain('### Todo')
        expect(markdown).toContain('### In Progress')
        expect(markdown).toContain('### Done')
        expect(markdown).toContain('- [ ] **Review project requirements**')
        expect(markdown).toContain('- [x] **Setup testing environment**')
      })

      it('should handle empty tasks', () => {
        const markdown = formatTasksAsMarkdown([])
        expect(markdown).toContain('## Tasks')
        expect(markdown).toContain('No tasks created.')
      })

      it('should include priority and due date information', () => {
        const markdown = formatTasksAsMarkdown(mockTasks)
        
        expect(markdown).toContain('(High Priority)')
        expect(markdown).toContain('Due:')
        expect(markdown).toContain('Tags: review, requirements')
      })

      it('should not show Low priority explicitly', () => {
        const lowPriorityTask = { ...mockTasks[0], priority: 'Low' as const }
        const markdown = formatTasksAsMarkdown([lowPriorityTask])
        
        expect(markdown).not.toContain('(Low Priority)')
      })
    })

    describe('formatTranscriptsAsMarkdown', () => {
      it('should format transcripts with timestamps', () => {
        const markdown = formatTranscriptsAsMarkdown(mockTranscriptChunks)
        
        expect(markdown).toContain('## Transcripts')
        expect(markdown).toContain('Welcome everyone to today\'s meeting')
        expect(markdown).toContain('**[')
        expect(markdown).toContain(']**')
      })

      it('should handle empty transcripts', () => {
        const markdown = formatTranscriptsAsMarkdown([])
        expect(markdown).toContain('## Transcripts')
        expect(markdown).toContain('No transcripts available.')
      })

      it('should include action items when present', () => {
        const markdown = formatTranscriptsAsMarkdown(mockTranscriptChunks)
        
        expect(markdown).toContain('*Action Items:*')
        expect(markdown).toContain('- review requirements')
        expect(markdown).toContain('- update documentation')
      })
    })

    describe('exportToMarkdown', () => {
      it('should create complete markdown export', () => {
        const markdown = exportToMarkdown(mockMeeting)
        
        expect(markdown).toContain(`# ${mockMeeting.title}`)
        expect(markdown).toContain('**Date:**')
        expect(markdown).toContain('**Time:**')
        expect(markdown).toContain('**Participants:**')
        expect(markdown).toContain('## Agenda')
        expect(markdown).toContain('## Notes')
        expect(markdown).toContain('## Tasks')
        expect(markdown).toContain('## Transcripts')
      })

      it('should handle meeting without participants', () => {
        const meetingWithoutParticipants = {
          ...mockMeeting,
          metadata: { ...mockMeeting.metadata, participants: [] }
        }
        const markdown = exportToMarkdown(meetingWithoutParticipants)
        
        expect(markdown).not.toContain('**Participants:**')
      })

      it('should handle meeting without description', () => {
        const meetingWithoutDesc = {
          ...mockMeeting,
          metadata: { ...mockMeeting.metadata, description: undefined }
        }
        const markdown = exportToMarkdown(meetingWithoutDesc)
        
        expect(markdown).not.toContain('**Description:**')
      })

      it('should include end time when available', () => {
        const meetingWithEndTime = {
          ...mockMeeting,
          endTime: '2024-01-15T11:00:00Z'
        }
        const markdown = exportToMarkdown(meetingWithEndTime)
        
        expect(markdown).toContain(' - ')
      })
    })
  })

  describe('Shareable Links', () => {
    it('should generate shareable link correctly', () => {
      const link = generateShareableLink(mockMeeting)
      
      expect(link).toContain('https://example.com/meeting?session=')
      expect(link.length).toBeGreaterThan(50)
    })

    it('should parse shareable link data correctly', () => {
      // Mock URLSearchParams
      const mockGet = vi.fn().mockReturnValue(encodeSessionData(mockMeeting))
      vi.stubGlobal('URLSearchParams', vi.fn(() => ({ get: mockGet })))
      
      const meeting = parseShareableLinkData()
      expect(meeting).toEqual(mockMeeting)
    })

    it('should return null when no session parameter', () => {
      const mockGet = vi.fn().mockReturnValue(null)
      vi.stubGlobal('URLSearchParams', vi.fn(() => ({ get: mockGet })))
      
      const meeting = parseShareableLinkData()
      expect(meeting).toBeNull()
    })

    it('should handle invalid session data', () => {
      const mockGet = vi.fn().mockReturnValue('invalid-data')
      vi.stubGlobal('URLSearchParams', vi.fn(() => ({ get: mockGet })))
      
      const meeting = parseShareableLinkData()
      expect(meeting).toBeNull()
    })
  })

  describe('File Download', () => {
    it('should download file correctly', () => {
      const content = 'test content'
      const filename = 'test.txt'
      
      downloadFile(content, filename)
      
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('should download markdown with correct filename', () => {
      downloadMarkdown(mockMeeting)
      
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('Clipboard Operations', () => {
    it('should copy to clipboard successfully', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: mockWriteText }
      })
      
      const result = await copyToClipboard('test text')
      
      expect(result).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith('test text')
    })

    it('should use fallback when clipboard API fails', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard failed'))
      const mockExecCommand = vi.fn().mockReturnValue(true)
      const mockSelect = vi.fn()
      
      vi.stubGlobal('navigator', {
        clipboard: { writeText: mockWriteText }
      })
      
      mockCreateElement.mockReturnValue({
        value: '',
        select: mockSelect,
      })
      
      vi.stubGlobal('document', {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
        execCommand: mockExecCommand,
      })
      
      const result = await copyToClipboard('test text')
      
      expect(result).toBe(true)
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
    })

    it('should return false when both methods fail', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard failed'))
      const mockExecCommand = vi.fn().mockImplementation(() => {
        throw new Error('ExecCommand failed')
      })
      
      vi.stubGlobal('navigator', {
        clipboard: { writeText: mockWriteText }
      })
      
      vi.stubGlobal('document', {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
        execCommand: mockExecCommand,
      })
      
      const result = await copyToClipboard('test text')
      
      expect(result).toBe(false)
    })
  })
})