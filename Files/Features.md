Agenda Generation (Kiro AI Specs)
User Flow

Input: Meeting title, duration (e.g. 45 min), list of 3–10 topics (free text).

Trigger: “Generate Agenda” button calls your Kiro CLI hook.

Output: Markdown agenda with:

Heading and subtitle (meeting title + date/time)

Time‑slots per topic (automatically balanced; final 5 min wrap‑up)

Bullet “Desired Outcomes” & “Pre-reads” section

Kiro Spec (.kiro/specs/agenda.yaml)

yaml
Copy
Edit
title: Create Meeting Agenda
spec:
  user_story: >
    As a meeting organizer, I want a clear, time‑balanced agenda
    so attendees know what to prepare and when we’ll wrap up.
  acceptance_criteria:
    - Use all provided topics, dividing total duration proportionally.
    - Include a “Wrap‑Up” slot of at least 5 min.
    - List optional “Pre‑reads” section if topics include document links.
Hook (.kiro/hooks/onAgendaCreated.ts)

ts
Copy
Edit
import { sendAgendaToEmail } from '../src/utils/sendEmail';
export default async function onAgendaCreated(agendaMd: string) {
  await sendAgendaToEmail(userEmail, agendaMd);
}
UI Notes

Render Markdown via react-markdown.

“Edit Slot” controls allow dragging time blocks (bonus).

Persist to localStorage under key meetingflow:agenda.

2. Transcription & Extraction
Voice Upload & AssemblyAI

Component: <TranscriptUploader>, accepts .mp3/.wav.

API Call:

ts
Copy
Edit
const transcript = await client.transcripts.transcribe({ 
  audio: fileUrl, speech_model: 'universal' 
});
Poll until transcript.status === 'completed', then pass transcript.text to Kiro.

Kiro Spec (.kiro/specs/transcript.yaml)

yaml
Copy
Edit
title: Extract Meeting Summary
spec:
  user_story: >
    As a team member, I want concise action items,
    decisions, and summary paragraphs extracted from transcript text.
  acceptance_criteria:
    - List “Action Items:” as ✓‑prefixed bullets with owner & deadline if spoken.
    - “Decisions Made:” separate section.
    - A 3‑sentence high‑level summary.
Hook (.kiro/hooks/onTranscriptUploaded.ts)

ts
Copy
Edit
import { sendFollowUps } from '../src/utils/sendEmail';
export default async function onTranscriptUploaded(transcriptTxt: string) {
  const { actionItems, summary } = await parseTranscript(transcriptTxt);
  // Save to localStorage
  localStorage.setItem('meetingflow:summary', summary);
  await sendFollowUps(actionItems);
}
UI Notes

Show progress spinner during transcription.

Display extracted items in <SummaryView> with checkboxes.

3. Notion‑like Rich Editor
Editor Core

Library: TipTap React.

Features:

Headings (H1–H4), bold/italic, bullet/numbered lists

Inline links, code blocks

To‑do checkboxes (✓ toggles status)

Block Management (MVP)

Blocks are TipTap nodes; users reorder via up/down buttons.

Each block saved to LocalStorage as JSON under meetingflow:notes.

Collaboration (WebRTC P2P)

Use simple-peer to establish data channels.

On content change, broadcast the changed node’s JSON delta to peers.

Merge with last‑write‑wins for simplicity.

Export

“Download Markdown” button: use editor.getJSON() → convert to Markdown via TipTap’s Markdown extension.

“Export PDF” button: wrap <RichEditor> in a react-to-print component.

4. Real‑time Peer‑to‑Peer Sync
Connection Setup

On “Share Session” click, one user becomes host (generates a random room ID).

Others join via navigator.share or manual code entry.

Data Channel Flow

ts
Copy
Edit
import SimplePeer from 'simple-peer';
const peer = new SimplePeer({ initiator: isHost, trickle: false });
peer.on('signal', signalData => sendSignalToOther(signalData));
peer.on('data', data => applyEditorDelta(JSON.parse(data)));
applyEditorDelta integrates with TipTap’s editor.chain().focus().insertContent(delta).

Edge Cases

Network drop: reconnect attempts with exponential backoff.

Conflict resolution: last write wins; track block timestamps.

5. Task Manager (Todoist‑style)
Data Model

ts
Copy
Edit
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;      // ISO
  priority: 'Low'|'Medium'|'High';
  status: 'Todo'|'In Progress'|'Done';
  tags: string[];
  created: string;
  updated?: string;
}
UI Components

<TaskList>: groups by status or due date.

<TaskCard>: shows title, due date badge, priority color.

Add/Edit modal with date picker (react-datepicker) & tag inputs.

Actions & Storage

Use React Context or Zustand for state.

Persist to LocalStorage under meetingflow:tasks.

Auto‑create tasks from actionItems in onTranscriptUploaded hook.

Reminders

On task creation or status change, schedule an EmailJS send via setTimeout (while session open) or on next app load check for due items and trigger.

Template variables: task_title, dueDate, assignedTo.

6. Voice Commands (Web Speech API)
Initialization

ts
Copy
Edit
const recognition = new window.SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';
Commands & Parsing

“Start recording” → recognition.start()

“Add topic [text]” → capture event.result[0].transcript → append to topics array

“Mark action item [text]” → create a new Task with title = text

UI Feedback

Show live transcript in small overlay.

Visual cue (mic icon) toggles recording state.

7. Multi‑Format Export & Share Links
Markdown Export

Agenda, summary, notes all exported via react-markdown reverser or TipTap Markdown plugin.

PDF Export

Wrap target component in <PrintComponent ref={printRef}>

Invoke useReactToPrint({ content: () => printRef.current }).

Shareable Link

Serialize app state (agenda, notes, tasks) into a compact JSON string, Base64‑encode, and append as ?data= URL param.

On load, detect data param, decode, and hydrate localStorage.

Every piece of MeetingFlow—from spec‑driven agendas to P2P collaborative notes, from AI‑extracted action items to a full Todoist‑style task manager—is built entirely frontend, 100% free, and no backend required. Kiro AI orchestrates your dev workflow via specs & hooks, AssemblyAI powers transcription, and EmailJS keeps reminders flowing. All state lives in LocalStorage or in your browser peers. This is your privacy‑first, lightweight, yet powerful meeting platform ready for the Kiro Hackathon.

How to make These Features

1. Agenda Generation (via Kiro AI Specs)
You’ll build a form with inputs for:

Meeting Title (string)

Total Duration (number in minutes)

List of Topics (dynamic input array)

When the “Generate Agenda” button is clicked, your app triggers the Kiro hook (/.kiro/hooks/onAgendaCreated.ts). This calls a local function to:

Proportionally divide time per topic (basic math)

Add a final 5-min wrap-up

Generate Markdown content: Title + Date, “Desired Outcomes”, “Pre-reads”

Save agenda as Markdown in localStorage under meetingflow:agenda

Use react-markdown to render this Markdown beautifully in the UI. Optionally add drag-to-edit time slots and re-calculate durations dynamically.

2. Transcription & Extraction (AssemblyAI + Kiro)
You’ll create a <TranscriptUploader> component to:

Accept .mp3/.wav files (HTML file input)

Upload to AssemblyAI and poll for completion

Retrieve the transcript text

Once received, the transcript is sent to the onTranscriptUploaded hook (/.kiro/hooks/onTranscriptUploaded.ts). In that hook, you:

Extract “Action Items,” “Decisions Made,” and a Summary using Kiro

Store the result in localStorage:meetingflow:summary

Use EmailJS to send action items as email reminders

UI includes a spinner for loading, and a <SummaryView> component showing extracted notes with checkboxes.

3. Notion‑Like Rich Editor (TipTap-based Personal Knowledge Base)
This is your app’s modular editor for taking, creating, and editing notes—not just extracting them from meetings. Think of it as your own local, Notion-like writing surface with blocks.

🧱 Core Setup:
Use TipTap React as the WYSIWYG editor

Enable:

Headings (H1–H4)

Bold / Italic

Bullet & Numbered Lists

Inline Links

Code blocks

To-do Checkboxes (type: taskItem)

📦 Block Logic (MVP):
Break content into blocks (TipTap node types)

For each block:

Show buttons to move it up/down (reorder)

Save each block’s JSON in localStorage as meetingflow:notes so the data is persistent between sessions.

📤 Export Options:
Download Markdown: Convert TipTap JSON → Markdown string via tiptap-markdown extension, download as .md

Export PDF: Wrap the editor in react-to-print's <PrintComponent> to generate a clean PDF.

🧠 Advanced:
You can later support features like:

Slash commands / to insert a new block

Template notes or meeting templates

Inline embedding of transcripts or tasks

This becomes your living workspace, not just a viewer.

4. Real-Time Peer-to-Peer Sync (WebRTC-based Collaboration)
Enable real-time collaboration without any backend—P2P using WebRTC.

🔗 Setup:
On “Share Session” click:

User becomes host and generates a room ID

Uses simple-peer to create a WebRTC connection (no signaling server in MVP; maybe QR/manual sharing)

🛜 Peer Logic:
ts
Copy
Edit
const peer = new SimplePeer({ initiator: isHost, trickle: false });
peer.on('signal', signalData => sendSignalToOther(signalData)); // QR or copy-paste
peer.on('data', data => applyEditorDelta(JSON.parse(data)));
Each content change in TipTap emits a delta JSON, which you:

Broadcast to all connected peers

Apply to the TipTap instance using .chain().focus().insertContent(...)

Use last-write-wins to resolve any sync conflicts.

🧪 Handling Edge Cases:
On disconnect, reconnect with exponential backoff

Timestamp each block to resolve write collisions

Optionally alert user if sync is paused or failed

This makes your note editor collaborative like Google Docs or Notion—but without any server!

5. Task Manager (Like Todoist, Powered by Context)
A full-featured local task manager that lives inside your productivity stack. Created manually or extracted from transcripts.

📦 Data Model:
ts
Copy
Edit
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
  tags: string[];
  created: string;
  updated?: string;
}
🧱 Core Features:
Store tasks using Zustand or useContext → persist to localStorage under meetingflow:tasks

Support creation, editing, and status updates via modal

Auto-generate tasks from transcript action items (✓ John to update budget by Friday)

📋 UI Components:
<TaskList />: Filter by due date, priority, or status

<TaskCard />: Shows title, due date, status color, priority icon

Modal form for adding/editing tasks with:

react-datepicker

tag input

radio toggle for status/priority

⏰ Reminder System (Zero backend):
On any dueDate addition:

Use setTimeout for short-term reminders

On app load, check for missed/pending tasks and trigger EmailJS reminder

Template:

yaml
Copy
Edit
Hi John, don’t forget:
📝 Task: "Update Budget"
⏰ Due: Friday, 3:00 PM
6. Voice Commands (Hands-Free Workflow via Web Speech API)
Let users interact with your app by speaking, not typing.

🎤 Setup:
ts
Copy
Edit
const recognition = new window.SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';
🔮 Commands to Implement:
"Start recording" → begins voice recognition

"Add topic [text]" → appends topic to current meeting agenda

"Mark action item [text]" → creates a task with that title

"Set due [time or date]" → assigns a due date to last task

🪞 UI Feedback:
Show a floating live transcript box

Toggle mic icon (off/on) while listening

Optional error/warning display for unsupported phrases

This allows you to drive meetings or note-taking entirely hands-free.

7. Multi-Format Export & Share Links (Offline Sync & Share)
Easily export or share your whole meeting workspace—without a database.

📦 Markdown & PDF Export:
For Notes, Agendas, Tasks:

Use react-markdown or TipTap Markdown converter

Use react-to-print to export PDF of rich notes or summary

🔗 Shareable State Links:
Serialize App State:

ts
Copy
Edit
const fullState = {
  agenda: ..., notes: ..., tasks: ...
};
const encoded = btoa(JSON.stringify(fullState));
const shareURL = `https://your.app?data=${encoded}`;
On Load:

ts
Copy
Edit
const data = new URLSearchParams(window.location.search).get("data");
if (data) {
  const parsed = JSON.parse(atob(data));
  localStorage.setItem("meetingflow:agenda", parsed.agenda);
  ...
}
This gives you one-click shareable sessions—without needing any backend, auth, or cloud sync.