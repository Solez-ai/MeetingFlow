# MeetingFlow

MeetingFlow is a privacy-first, browser-based meeting productivity suite that helps you manage agendas, take notes, and track tasks - all without requiring a backend or cloud storage.

## Features

- **Agenda Management**: Create and manage meeting agendas with time balancing
- **Rich Text Notes**: Notion-style block editor powered by TipTap
- **Task Management**: Kanban-style task board with filtering and sorting
- **Transcription**: Upload audio files for automatic transcription (via AssemblyAI)
- **Voice Commands**: Control the app hands-free with voice commands
- **Real-time Collaboration**: Peer-to-peer collaboration without a server
- **Export & Share**: Export to Markdown, PDF, or share via encoded links

## Task Management System

The task management system in MeetingFlow is designed to be intuitive and powerful, allowing you to:

### Creating Tasks

Tasks can be created in multiple ways:

1. **Manually**: Click the "New Task" button in the task panel
2. **From Notes**: Highlight text in the notes editor and click "Convert to Task"
3. **From Transcripts**: Click "Make Task" on detected action items in transcripts
4. **From Voice Commands**: Say "Mark action item [text]" to create a task

### Task Organization

Tasks are organized in a Kanban board with three columns:

- **To Do**: Tasks that need to be done
- **In Progress**: Tasks that are currently being worked on
- **Done**: Completed tasks

You can drag and drop tasks between columns to update their status.

### Task Views

The task panel offers multiple views:

- **Kanban**: Traditional board view with columns for each status
- **Today**: Tasks due today
- **Upcoming**: Tasks due in the next 7 days
- **All**: All tasks in a list view

### Task Filtering and Sorting

You can filter tasks by:

- **Tags**: Filter by specific tags
- **Priority**: Sort by High, Medium, or Low priority
- **Due Date**: Sort by due date
- **Creation Date**: Sort by when the task was created

### Task Integration with Notes

The notes editor is integrated with the task system:

- Highlight text and convert it to a task
- Task checkboxes in the editor automatically create tasks when checked
- The system can detect potential tasks in your notes and suggest creating them

### Task Notifications

When tasks are created or completed:

- Visual feedback with toast notifications
- Confetti animation for task completion
- Email reminders for upcoming tasks (via EmailJS)

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `http://localhost:5173`

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Zustand**: State management
- **TipTap**: Rich text editor
- **Tailwind CSS**: Styling
- **Shadcn/UI**: UI components
- **React Router**: Navigation
- **AssemblyAI**: Transcription
- **EmailJS**: Email notifications
- **WebRTC**: Peer-to-peer collaboration

## Privacy First

MeetingFlow is designed with privacy in mind:

- All data is stored locally in your browser's localStorage
- No data is sent to any server unless explicitly requested
- Collaboration is peer-to-peer without a central server
- API keys are stored in your browser and never shared

## License

MIT