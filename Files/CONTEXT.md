MeetingFlow App Functionality & UX Map
Welcome to the inner working document for the MeetingFlow application. This file explains the app’s user journey, feature triggers, data flows, and where each feature fits within the interface.


MeetingFlow is a fully frontend meeting productivity tool designed to help users manage their entire meeting workflow—from agenda planning to real-time transcription, collaborative note-taking, and task generation—without relying on a backend or external databases. It’s inspired by tools like Notion, Todoist, and Otter.ai, but runs entirely in the browser using technologies like LocalStorage, EmailJS, AssemblyAI, and Zustand for state management. When a user opens the app, it checks for existing data like notes, agenda items, and tasks stored locally, and if none are found, the user is invited to create a new meeting session. Starting a meeting begins with entering a title and optionally defining agenda items either by typing or using voice commands like “Add topic team goals.” The meeting workspace then launches into an interactive dashboard where the left sidebar contains the agenda items, the center features a Tiptap-based Notion-style block editor for freeform note-taking, and the right panel manages tasks. Users can highlight any part of their notes and instantly convert them into actionable tasks, which are stored and tracked in a kanban board categorized into Todo, In Progress, and Done. Tasks support due dates, tagging, prioritization, and reminders sent via EmailJS, with all logic handled on the client side.

One of the app’s most powerful features is transcription. Users can either upload audio files for automatic transcription using AssemblyAI or enable live transcription with a mic toggle that sends audio through a Python WebSocket backend. As speech is transcribed, the app analyzes text for action-based patterns (e.g., “we should,” “John will”) and offers to auto-generate tasks. Transcripts and notes are timestamped, saved, and connected to relevant agenda items. Additionally, MeetingFlow supports voice commands using the Web Speech API, allowing users to say phrases like “next topic” or “mark action item” to interact hands-free. Notes follow a modular Notion-style block structure that allows dragging, reordering, and rich formatting including checklists, quotes, and headings. All content is autosaved every few seconds to LocalStorage to prevent data loss.

Collaboration is built in through optional peer-to-peer sync powered by WebRTC. By enabling “Collaboration Mode,” users can share a session link or QR code with another user, allowing them to edit notes together in real time. No servers are involved; the sync happens locally between browsers. The app also allows full export of meeting data as PDF or Markdown and can generate a shareable link that embeds session state directly into the URL using base64 encoding. For privacy, all data remains on the user’s device unless manually exported or emailed. There are no accounts, no cloud dependencies, and a settings option to wipe all data if needed.

Every part of the interface is tightly connected—agenda items drive note structure, notes drive tasks, and tasks drive reminders and follow-ups. Users can explore different sections of the app through the navbar: New Meeting, Dashboard, Tasks, Notes Archive, or Export. Buttons and icons are clearly labeled, voice commands are accessible, and everything is optimized for quick keyboard and voice-based workflows. In essence, MeetingFlow is a silent, smart AI-powered assistant that stays out of your way but enhances every moment of your meetings—from planning to follow-up—without requiring an internet connection or sign-in. It gives users total control over their meeting flow, hence the name.


🌐 Core Philosophy
MeetingFlow is a 100% frontend productivity tool built for individuals and small teams who want a seamless space to:

Host meetings

Take collaborative notes

Transcribe conversations (live & pre-recorded)

Generate agendas and tasks automatically

Organize their own workspace like Notion, without any backend.

It’s modular, offline-capable, and works entirely through localStorage, EmailJS, AssemblyAI, and in-browser APIs.

🏠 Main App Structure
Pages / Views
diff
Copy
Edit
- Home / Dashboard
- New Meeting
- Active Meeting (live workspace)
- Notes & Tasks Manager
- Recordings Archive
- Export & Share
Each view contains contextual components that update live based on user interactions and localStorage state.

🔄 App Boot / Data Flow
When the app starts:

It checks localStorage for:

agenda

notes

tasks

transcripts

If found → it preloads these into Zustand / Context state.

If not → user is greeted with “Start a new meeting” CTA.

📅 Starting a New Meeting
User Flow:

Click "Start Meeting"

Modal opens: Enter Meeting Title, Optional Tags

Create Agenda:

Add items by typing or using voice command:
"Add topic budget discussion"

Click “Start Meeting” to open Live Workspace.

🎤 Live Transcription (AssemblyAI)
Used In: ActiveMeeting.tsx

Options:
Pre-recorded upload → drag & drop MP3/WAV

Triggers AssemblyAI upload + polling

Live transcription → toggle mic using button

Runs Python WebSocket backend

Auto-scrolls with live transcript

Transcript Feed Auto-features:

Keywords like “action item” or “John will…” auto-highlight and offer Make Task button.

Every chunk is timestamped and stored to meetingflow:transcripts.

🗃️ Agenda & Notes Workspace
📌 Agenda (Left Sidebar)
Shows all topics added before or during meeting.

Can rearrange topics using drag-and-drop.

Clicking a topic scrolls to that section in the notes.

✍️ Notes (Center)
Uses Tiptap for Notion-style editing.

Users can:

Create headings, bullets, checklists, quotes

Mention @topics (to associate with agenda items)

Highlight text to convert into Tasks

Autosaves every 5 seconds to localStorage.

🧠 Notion-Like Block System
Each note is a “block”:

Stored with blockId, content, type, linkedToAgendaItem

Reorderable, deletable, persistent

✅ Task Manager
Accessed From:

Navbar → “Tasks”

In-Meeting → Highlight text → “Convert to Task”

Features:
Kanban-style board: Todo, In Progress, Done

Due dates using react-datepicker

Priority selector (color-coded)

Tags and filtering

Export to PDF/Markdown

Email reminders via EmailJS (meetingflow:reminders queue)

Behind the Scenes:
Tasks stored in meetingflow:tasks

Email reminders are triggered on:

App startup → check for due dates within next 1 hour

Task creation with date → sets setTimeout for in-app popup and sends email

🧏 Voice Command Integration (Web Speech API)
Button: 🎙️ Microphone Toggle
When active, app listens for key phrases:

css
Copy
Edit
“Start recording” → toggles Assembly live
“Add topic [x]” → adds agenda item
“Mark action item [x]” → creates task
“Next topic” → scrolls to next agenda section
This makes MeetingFlow hands-free for facilitators or speakers.

🤝 Real-time Collaborative Notes
Technology:
WebRTC peer-to-peer sync

JSON patching of tiptap editor state

Usage:
Toggle “Enable Collaboration” before meeting

Share Peer ID (via QR or link) with others

Changes propagate in real-time

Useful for team meetings, pair note-taking, or remote workflows.

📤 Export & Sharing
Export Options:
PDF: Uses react-to-print

Markdown: Converts notes/tasks/agenda to Markdown format

Share Link:

Encodes full session state into base64 URL param

Clicking link on another device loads same session

Bonus: All data is exportable without backend using Blob + FileSaver.js

🧠 Developer Context (Logic Map)
Zustand Store (or Context):
ts
Copy
Edit
{
  agenda: AgendaItem[]
  notes: NoteBlock[]
  tasks: Task[]
  transcripts: TranscriptChunk[]
  user: { micEnabled: boolean, meetingTitle: string }
}
App State Logic:
onTranscriptChunkReceived → updates transcript + extracts tasks

onNoteBlockEdited → updates note and syncs via WebRTC (if enabled)

onTaskStatusChange → updates UI and reminders queue

onExportClick → bundles data, formats as PDF/Markdown

onVoiceCommand → maps string → action → runs callback

🎯 Where to Click?
Feature	How to Trigger	Where it Appears
Start Meeting	+ New Meeting	Loads Active Workspace
Add Agenda	Agenda > + or voice	Sidebar (left)
Take Notes	Just start typing	Middle editor
Voice Control	Mic icon toggle	Floating on-screen
Add Task	Highlight → “Task” or Tasks tab	Right panel
Export	Top right “Export” dropdown	PDF / Markdown / Link
Record Audio	Click “Record” or drag audio	Below Notes
Real-Time Notes	Toggle “Collab Mode”	Top bar
Share Session	“Copy Share Link” button	Bottom toolbar

🧪 Testing It Locally
App state can be fully tested using:

bash
Copy
Edit
npm run dev
Transcription will simulate if API fails

Tasks/Reminders live update

PDF export works from browser print API

🧰 Tools Used
React, Vite, TypeScript

Tailwind CSS + Shadcn/ui

Zustand or Context API

EmailJS for reminders

AssemblyAI for audio

Tiptap for notes

react-to-print, react-datepicker

WebRTC for collaboration

SpeechRecognition API for voice control

