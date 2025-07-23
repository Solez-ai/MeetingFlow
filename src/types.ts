export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  created: string;
  tags: string[];
  assignee?: string;
  createdFrom?: 'manual' | 'transcript' | 'notes';
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  participants: string[];
  agenda?: AgendaItem[];
  notes?: string;
  tasks: Task[];
  recordings?: Recording[];
  transcripts?: Transcript[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration?: number; // in minutes
  presenter?: string;
  completed: boolean;
}

export interface Recording {
  id: string;
  url: string;
  duration: number; // in seconds
  created: string;
}

export interface Transcript {
  id: string;
  content: string;
  speakerName: string;
  timestamp: string;
  duration: number; // in seconds
}