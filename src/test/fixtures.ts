import { AgendaItem, Meeting, NoteBlock, Task, TranscriptChunk } from '@/types'

export const mockAgendaItems: AgendaItem[] = [
  {
    id: '1',
    title: 'Project Overview',
    duration: 15,
    description: 'Discuss project goals and timeline',
    order: 0,
  },
  {
    id: '2',
    title: 'Technical Discussion',
    duration: 20,
    description: 'Review technical requirements',
    order: 1,
  },
  {
    id: '3',
    title: 'Next Steps',
    duration: 10,
    description: 'Define action items',
    order: 2,
  },
]

export const mockNoteBlocks: NoteBlock[] = [
  {
    id: '1',
    type: 'heading',
    content: 'Meeting Notes',
    timestamp: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    type: 'paragraph',
    content: 'This is a sample note block with some content.',
    timestamp: '2024-01-15T10:01:00Z',
  },
  {
    id: '3',
    type: 'todo',
    content: 'Complete the project documentation',
    timestamp: '2024-01-15T10:02:00Z',
  },
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review project requirements',
    description: 'Go through all requirements and validate them',
    dueDate: '2024-01-20',
    priority: 'High',
    status: 'Todo',
    tags: ['review', 'requirements'],
    createdFrom: 'manual',
    created: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Update documentation',
    description: 'Update the project documentation with latest changes',
    dueDate: '2024-01-18',
    priority: 'Medium',
    status: 'In Progress',
    tags: ['documentation'],
    assignee: 'john@example.com',
    createdFrom: 'transcript',
    created: '2024-01-15T10:05:00Z',
    updated: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    title: 'Setup testing environment',
    priority: 'Low',
    status: 'Done',
    tags: ['testing', 'setup'],
    createdFrom: 'notes',
    created: '2024-01-14T09:00:00Z',
    updated: '2024-01-15T08:00:00Z',
  },
]

export const mockTranscriptChunks: TranscriptChunk[] = [
  {
    id: '1',
    text: 'Welcome everyone to today\'s meeting. Let\'s start with the project overview.',
    timestamp: 1642248000000,
    confidence: 0.95,
    speaker: 'Speaker 1',
  },
  {
    id: '2',
    text: 'We need to review the requirements and update the documentation by Friday.',
    timestamp: 1642248030000,
    confidence: 0.92,
    speaker: 'Speaker 2',
    actionItems: ['review requirements', 'update documentation'],
  },
  {
    id: '3',
    text: 'I will take care of setting up the testing environment.',
    timestamp: 1642248060000,
    confidence: 0.88,
    speaker: 'Speaker 1',
    actionItems: ['setup testing environment'],
  },
]

export const mockMeeting: Meeting = {
  id: 'meeting-1',
  title: 'Weekly Team Sync',
  startTime: '2024-01-15T10:00:00Z',
  agenda: mockAgendaItems,
  notes: mockNoteBlocks,
  tasks: mockTasks,
  transcripts: mockTranscriptChunks,
  metadata: {
    duration: 45,
    participants: ['john@example.com', 'jane@example.com'],
    tags: ['weekly', 'sync'],
  },
}

export const mockSettings = {
  theme: 'light' as const,
  autoSave: true,
  autoSaveInterval: 5,
  voiceCommandsEnabled: true,
  emailNotifications: true,
  collaborationDefaults: {
    autoAcceptPeers: false,
    shareAgendaByDefault: true,
  },
  exportDefaults: {
    includeTimestamps: true,
    includeMetadata: true,
  },
}

export const mockCollaborationState = {
  isHost: true,
  roomId: 'room-123',
  peers: [
    {
      id: 'peer-1',
      name: 'John Doe',
      cursor: { x: 100, y: 200 },
    },
  ],
  isConnected: true,
}