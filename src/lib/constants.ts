/**
 * Application constants
 */

// Environment variables
export const ENV = {
  ASSEMBLYAI_API_KEY: import.meta.env.VITE_ASSEMBLYAI_API_KEY,
  EMAILJS_USER_ID: import.meta.env.VITE_EMAILJS_USER_ID,
  EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
} as const

// LocalStorage keys
export const STORAGE_KEYS = {
  MEETINGS: 'meetingflow:meetings',
  SETTINGS: 'meetingflow:settings',
  CURRENT_MEETING: 'meetingflow:current-meeting',
  THEME: 'meetingflow:theme',
  APP_STATE: 'meetingflow:app-state',
} as const

// Application constants
export const APP_CONFIG = {
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
  DEFAULT_MEETING_DURATION: 60, // minutes
  WRAP_UP_TIME: 5, // minutes
  MAX_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB
} as const

// AssemblyAI configuration
export const ASSEMBLYAI_CONFIG = {
  speechModel: 'universal' as const,
  languageCode: 'en' as const,
  punctuate: true,
  formatText: true,
}

// Voice command patterns
export const VOICE_COMMAND_PATTERNS = {
  ADD_TOPIC: /^add topic (.+)$/i,
  MARK_ACTION: /^mark action item (.+)$/i,
  START_RECORDING: /^start recording$/i,
  STOP_RECORDING: /^stop recording$/i,
  NEXT_TOPIC: /^next topic$/i,
  PREVIOUS_TOPIC: /^previous topic$/i,
}

// Task priorities
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const

// Task statuses
export const TASK_STATUSES = ['Todo', 'In Progress', 'Done'] as const

// Note block types
export const NOTE_BLOCK_TYPES = [
  'heading',
  'paragraph',
  'bullet',
  'todo',
  'code',
  'quote',
] as const