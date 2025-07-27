import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateSessionLink,
  parseSessionLink,
  isSessionLinkValid,
  extractRoomId,
  SessionData,
} from '../sessionLink'

beforeEach(() => {
  // Mock window.location
  vi.stubGlobal('window', {
    location: {
      origin: 'https://example.com',
      pathname: '/meeting',
    },
  })
  
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Session Link Utils', () => {
  const mockRoomId = '12345678-1234-1234-1234-123456789abc'
  const mockMeetingId = 'meeting-123'
  const mockTitle = 'Test Meeting'

  describe('generateSessionLink', () => {
    it('should generate session link with room ID only', () => {
      const link = generateSessionLink(mockRoomId)
      
      expect(link).toContain('https://example.com/meeting?session=')
      expect(link.length).toBeGreaterThan(50)
    })

    it('should generate session link with all parameters', () => {
      const link = generateSessionLink(mockRoomId, mockMeetingId, mockTitle)
      
      expect(link).toContain('https://example.com/meeting?session=')
      
      // Decode and verify the data
      const sessionParam = link.split('session=')[1]
      const sessionData = JSON.parse(atob(sessionParam))
      
      expect(sessionData.roomId).toBe(mockRoomId)
      expect(sessionData.meetingId).toBe(mockMeetingId)
      expect(sessionData.title).toBe(mockTitle)
      expect(sessionData.timestamp).toBeTruthy()
    })

    it('should include timestamp in session data', () => {
      const beforeTime = Date.now()
      const link = generateSessionLink(mockRoomId)
      const afterTime = Date.now()
      
      const sessionParam = link.split('session=')[1]
      const sessionData = JSON.parse(atob(sessionParam))
      
      expect(sessionData.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(sessionData.timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('parseSessionLink', () => {
    it('should parse valid session link correctly', () => {
      const link = generateSessionLink(mockRoomId, mockMeetingId, mockTitle)
      const sessionData = parseSessionLink(link)
      
      expect(sessionData).toBeTruthy()
      expect(sessionData!.roomId).toBe(mockRoomId)
      expect(sessionData!.meetingId).toBe(mockMeetingId)
      expect(sessionData!.title).toBe(mockTitle)
      expect(sessionData!.timestamp).toBeTruthy()
    })

    it('should return null for invalid URL', () => {
      const sessionData = parseSessionLink('not-a-url')
      expect(sessionData).toBeNull()
    })

    it('should return null for URL without session parameter', () => {
      const sessionData = parseSessionLink('https://example.com/meeting')
      expect(sessionData).toBeNull()
    })

    it('should return null for invalid base64 data', () => {
      const sessionData = parseSessionLink('https://example.com/meeting?session=invalid-base64')
      expect(sessionData).toBeNull()
    })

    it('should return null for invalid JSON data', () => {
      const invalidData = btoa('invalid json')
      const sessionData = parseSessionLink(`https://example.com/meeting?session=${invalidData}`)
      expect(sessionData).toBeNull()
    })

    it('should return null for session data without required fields', () => {
      const incompleteData = btoa(JSON.stringify({ timestamp: Date.now() }))
      const sessionData = parseSessionLink(`https://example.com/meeting?session=${incompleteData}`)
      expect(sessionData).toBeNull()
    })

    it('should handle session data with missing optional fields', () => {
      const minimalData: SessionData = {
        roomId: mockRoomId,
        timestamp: Date.now(),
      }
      const encodedData = btoa(JSON.stringify(minimalData))
      const link = `https://example.com/meeting?session=${encodedData}`
      
      const sessionData = parseSessionLink(link)
      
      expect(sessionData).toBeTruthy()
      expect(sessionData!.roomId).toBe(mockRoomId)
      expect(sessionData!.meetingId).toBeUndefined()
      expect(sessionData!.title).toBeUndefined()
    })
  })

  describe('isSessionLinkValid', () => {
    it('should return true for recent valid session link', () => {
      const link = generateSessionLink(mockRoomId)
      const isValid = isSessionLinkValid(link)
      
      expect(isValid).toBe(true)
    })

    it('should return false for expired session link', () => {
      const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      const expiredData: SessionData = {
        roomId: mockRoomId,
        timestamp: expiredTimestamp,
      }
      const encodedData = btoa(JSON.stringify(expiredData))
      const link = `https://example.com/meeting?session=${encodedData}`
      
      const isValid = isSessionLinkValid(link)
      
      expect(isValid).toBe(false)
    })

    it('should return false for invalid session link', () => {
      const isValid = isSessionLinkValid('invalid-link')
      
      expect(isValid).toBe(false)
    })

    it('should respect custom max age', () => {
      const timestamp = Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
      const sessionData: SessionData = {
        roomId: mockRoomId,
        timestamp,
      }
      const encodedData = btoa(JSON.stringify(sessionData))
      const link = `https://example.com/meeting?session=${encodedData}`
      
      // Should be invalid with 1 hour max age
      expect(isSessionLinkValid(link, 1)).toBe(false)
      
      // Should be valid with 3 hour max age
      expect(isSessionLinkValid(link, 3)).toBe(true)
    })
  })

  describe('extractRoomId', () => {
    it('should extract room ID from full session link', () => {
      const link = generateSessionLink(mockRoomId)
      const extractedId = extractRoomId(link)
      
      expect(extractedId).toBe(mockRoomId)
    })

    it('should extract room ID from UUID string', () => {
      const extractedId = extractRoomId(mockRoomId)
      
      expect(extractedId).toBe(mockRoomId)
    })

    it('should extract room ID from UUID string with whitespace', () => {
      const extractedId = extractRoomId(`  ${mockRoomId}  `)
      
      expect(extractedId).toBe(mockRoomId)
    })

    it('should return null for invalid UUID format', () => {
      const extractedId = extractRoomId('invalid-uuid')
      
      expect(extractedId).toBeNull()
    })

    it('should return null for empty string', () => {
      const extractedId = extractRoomId('')
      
      expect(extractedId).toBeNull()
    })

    it('should return null for invalid session link', () => {
      const extractedId = extractRoomId('https://example.com/meeting?session=invalid')
      
      expect(extractedId).toBeNull()
    })

    it('should handle different UUID case formats', () => {
      const upperCaseUuid = mockRoomId.toUpperCase()
      const extractedId = extractRoomId(upperCaseUuid)
      
      expect(extractedId).toBe(upperCaseUuid)
    })

    it('should validate UUID format strictly', () => {
      const invalidFormats = [
        '12345678-1234-1234-1234-12345678',  // Too short
        '12345678-1234-1234-1234-123456789abcd',  // Too long
        '12345678-1234-6234-1234-123456789abc',  // Invalid version (6)
        '12345678-1234-1234-c234-123456789abc',  // Invalid variant (c)
        '12345678_1234_1234_1234_123456789abc',  // Wrong separators
      ]
      
      invalidFormats.forEach(format => {
        expect(extractRoomId(format)).toBeNull()
      })
    })
  })
})