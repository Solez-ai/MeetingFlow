/**
 * Voice command types
 */

export interface VoiceCommand {
  pattern: RegExp
  action: (matches: string[]) => void
  description: string
  category: 'agenda' | 'tasks' | 'recording' | 'navigation'
}

export interface VoiceCommandResult {
  command: VoiceCommand
  matches: string[]
  success: boolean
  error?: string
}

export interface VoiceRecognitionState {
  isListening: boolean
  isSupported: boolean
  lastTranscript: string
  confidence: number
  error?: string
}