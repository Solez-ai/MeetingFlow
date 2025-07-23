/**
 * Core application types
 */

// Agenda types
export interface AgendaItem {
  id: string
  title: string
  duration: number // minutes
  description?: string
  order: number
}

// Notes types
export interface NoteBlock {
  id: string
  type: 'heading' | 'paragraph' | 'bullet' | 'todo' | 'code' | 'quote'
  content: string
  linkedToAgendaItem?: string
  timestamp: string
}

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Todo' | 'In Progress' | 'Done'
  tags: string[]
  assignee?: string
  createdFrom?: 'manual' | 'transcript' | 'notes'
  created: string
  updated?: string
}

// Transcript types
export interface TranscriptChunk {
  id: string
  text: string
  timestamp: number
  confidence: number
  speaker?: string
  actionItems?: string[]
}

export interface TranscriptionStatus {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text?: string
  audioUrl?: string
  error?: string
  createdAt: string
  updatedAt: string
}

// Meeting types
export interface Meeting {
  id: string
  title: string
  startTime: string
  endTime?: string
  agenda: AgendaItem[]
  notes: NoteBlock[]
  tasks: Task[]
  transcripts: TranscriptChunk[]
  metadata: {
    duration?: number
    participants?: string[]
    tags?: string[]
  }
}

// Collaboration types
export interface Peer {
  id: string
  name?: string
  cursor?: { x: number; y: number }
}

export interface CollaborationState {
  isHost: boolean
  roomId: string
  peers: Peer[]
  isConnected: boolean
}