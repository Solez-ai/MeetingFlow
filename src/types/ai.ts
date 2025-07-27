/**
 * AI Assistant types for MeetingFlow Buddy
 */

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  type?: 'text' | 'summary' | 'tasks' | 'reminder' | 'qa'
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  meetingId?: string
  createdAt: string
  updatedAt: string
}

export interface AIRequest {
  messages: AIMessage[]
  meetingContext?: {
    title: string
    agenda: any[]
    notes: any[]
    tasks: any[]
    transcripts: any[]
  }
  type: 'chat' | 'summary' | 'extract_tasks' | 'qa' | 'reminder'
}

export interface AIResponse {
  id: string
  content: string
  type: 'text' | 'summary' | 'tasks' | 'reminder' | 'qa'
  metadata?: {
    extractedTasks?: Array<{
      title: string
      description?: string
      priority: 'Low' | 'Medium' | 'High'
    }>
    summary?: {
      keyPoints: string[]
      decisions: string[]
      nextSteps: string[]
    }
  }
}

export interface AIState {
  isOpen: boolean
  isLoading: boolean
  currentConversation: AIConversation | null
  conversations: AIConversation[]
  error: string | null
  hasNewInsights: boolean
}

export interface AIActions {
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string, type?: AIRequest['type']) => Promise<void>
  generateSummary: () => Promise<void>
  extractTasks: () => Promise<void>
  clearError: () => void
  markInsightsRead: () => void
  createNewConversation: (meetingId?: string) => void
  loadConversation: (id: string) => void
}

export interface OpenRouterRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}

export interface OpenRouterResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIPromptTemplate {
  system: string
  user: (context: any) => string
}

export interface AIFeatureModule {
  name: string
  description: string
  prompt: AIPromptTemplate
  handler: (response: string, context: any) => void
}