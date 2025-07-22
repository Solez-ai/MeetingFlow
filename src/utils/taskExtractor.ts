/**
 * Task extraction utility
 * 
 * This module provides functions to extract potential tasks from text content
 * such as transcripts or notes.
 */

// Patterns that might indicate action items in text
const ACTION_PATTERNS = [
  // Direct action assignments
  /(\w+)\s+(will|shall|should|needs? to|has to|must)\s+([^.!?]+)/i,
  
  // Task assignments
  /assign(?:ed)?\s+(?:to)?\s+(\w+)(?:\s+to)?\s+([^.!?]+)/i,
  
  // Action items and todos
  /(?:action item|todo|to-do|task)(?:\s*\:|\s+is)?\s+([^.!?]+)/i,
  
  // Follow up items
  /follow(?:\s*|\-)up(?:\s+with)?\s+([^.!?]+)/i,
  
  // Commitments
  /(?:i|we|they)\s+(?:will|shall|agree to|commit to)\s+([^.!?]+)/i
]

/**
 * Extract potential action items from text
 */
export function extractActionItems(text: string): string[] {
  const actionItems: string[] = []
  
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Check each sentence for action patterns
  sentences.forEach(sentence => {
    const trimmedSentence = sentence.trim()
    
    // Skip very short sentences
    if (trimmedSentence.length < 10) return
    
    // Check against each pattern
    for (const pattern of ACTION_PATTERNS) {
      const match = trimmedSentence.match(pattern)
      if (match) {
        // Get the action part (last capturing group)
        const actionText = match[match.length - 1].trim()
        
        // Only add if it's a reasonable length
        if (actionText.length > 5 && actionText.length < 200) {
          actionItems.push(actionText)
        }
        
        // Only match one pattern per sentence
        break
      }
    }
  })
  
  // Remove duplicates
  return Array.from(new Set(actionItems))
}

/**
 * Extract tasks from transcript text
 */
export function extractTasksFromTranscript(transcriptText: string): string[] {
  return extractActionItems(transcriptText)
}

/**
 * Extract tasks from note content
 */
export function extractTasksFromNotes(noteContent: string): string[] {
  return extractActionItems(noteContent)
}

/**
 * Analyze text to determine if it contains an action item
 */
export function isLikelyActionItem(text: string): boolean {
  // Check against action patterns
  for (const pattern of ACTION_PATTERNS) {
    if (pattern.test(text)) {
      return true
    }
  }
  
  // Check for common action words
  const actionWords = ['create', 'update', 'review', 'send', 'prepare', 'schedule', 'complete']
  for (const word of actionWords) {
    if (text.toLowerCase().includes(word)) {
      return true
    }
  }
  
  return false
}