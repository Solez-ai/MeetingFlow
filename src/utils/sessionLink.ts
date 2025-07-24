/**
 * Session link utilities for collaboration
 */

export interface SessionData {
  roomId: string
  timestamp: number
  meetingId?: string
  title?: string
}

/**
 * Generate a shareable session link
 */
export const generateSessionLink = (roomId: string, meetingId?: string, title?: string): string => {
  const baseUrl = window.location.origin + window.location.pathname
  const sessionData: SessionData = {
    roomId,
    timestamp: Date.now(),
    meetingId,
    title
  }
  
  const encodedData = btoa(JSON.stringify(sessionData))
  return `${baseUrl}?session=${encodedData}`
}

/**
 * Parse a session link to extract room data
 */
export const parseSessionLink = (link: string): SessionData | null => {
  try {
    const url = new URL(link)
    const sessionParam = url.searchParams.get('session')
    if (!sessionParam) return null
    
    const sessionData = JSON.parse(atob(sessionParam))
    
    // Validate required fields
    if (!sessionData.roomId || !sessionData.timestamp) {
      return null
    }
    
    return sessionData as SessionData
  } catch (error) {
    console.error('Failed to parse session link:', error)
    return null
  }
}

/**
 * Check if a session link is valid and not expired
 */
export const isSessionLinkValid = (link: string, maxAgeHours: number = 24): boolean => {
  const sessionData = parseSessionLink(link)
  if (!sessionData) return false
  
  const now = Date.now()
  const maxAge = maxAgeHours * 60 * 60 * 1000 // Convert hours to milliseconds
  
  return (now - sessionData.timestamp) < maxAge
}

/**
 * Extract room ID from various input formats
 */
export const extractRoomId = (input: string): string | null => {
  // If it's a full URL with session parameter
  if (input.includes('session=')) {
    const sessionData = parseSessionLink(input)
    return sessionData?.roomId || null
  }
  
  // If it's just a room ID (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRegex.test(input.trim())) {
    return input.trim()
  }
  
  return null
}