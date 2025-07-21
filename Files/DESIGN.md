# Design.md — MeetingFlow UI/UX Guide

## 🧠 Design Philosophy

MeetingFlow should *feel* like your second brain—always ready, always quiet, never in the way. Inspired by tools like Notion, Linear, and Arc Browser, the interface is elegant, minimal, and frictionless. Everything feels **fast**, **light**, and **intentional**. We avoid clutter, use space generously, and offer soft transitions with micro-interactions.

Main vibe: ✨ “Calm intelligence.”  
Color theme: 🧊 Neutral background + electric accent  
Typography: Sans-serif (Inter, Satoshi, or Geist) — clean, readable, purposeful  
Shape language: Rounded corners, layered depth, slight glassmorphism

---

## 🧩 Layout Structure

### 🏠 Home / Dashboard
- **Welcome card**: Personalized greeting, recent meetings list
- **“Start New Meeting” button**: Primary CTA
- **Cards for recent agendas, tasks, notes**
- **Sidebar**: Icons for `Agenda`, `Notes`, `Tasks`, `Export`, `Settings`

### 📋 Agenda Generator
- Dynamic form: Add topic, expected time, and goal per section
- Voice input button (🎙️) to add topics by speaking
- “Generate Agenda” button (Kiro triggers AI spec engine)
- Smooth accordion to reorder/modify sections
- Agenda saved locally + shown as editable block list

### 📓 Real-Time Notes Editor (TipTap)
- Notion-style block editor
- Use `Heading`, `To-do`, `Paragraph`, `Bullet`, `Code`, `Quote`
- Action items highlighted → can be sent to Task Manager
- Color highlight = pending tasks
- Micro toolbar on text selection for formatting

### 👥 Collaborative Notes
- “Collaborate” button → generates WebRTC room code
- Invite peer: copy & paste session link
- Real-time sync via peer-to-peer
- Avatar indicators + colored cursors for contributors

### 📑 Transcription
- Upload audio or start live mic
- Progress bar shows upload/transcribing
- After processing: timeline UI + clickable transcript
- Auto-tag decisions, tasks, and notes with colored labels
- Add to agenda/notes with 1-click buttons

### ✅ Task Manager (Todoist-style)
- Add task, priority, due date, assignee (just email)
- Toggle views: All | Today | Upcoming | Completed
- Clean table-style layout with drag-and-drop
- Animation on complete (checkbox flip, light confetti)
- Email reminders via EmailJS

### 🔊 Voice Commands
- Mic icon bottom-right corner
- Use Web Speech API
- Commands: “Start Meeting”, “Add Topic: Budget Review”, “Mark Action Item”, “Stop Recording”
- Use snackbar feedback for confirmation (“Topic added ✔️”)

### 📤 Export Center
- Export menu: Markdown, PDF (react-to-print), share link
- Preview before export
- “Copy Link” generates encoded URL to share current state
- Modern modal UI with blurred backdrop

---

## 🎨 Visual Design System

### Theme Colors
- **Background**: `#f9fafb` (light) or `#101010` (dark mode)
- **Primary accent**: `#4f46e5` (Indigo 600) or customizable
- **Success**: `#22c55e`, **Warning**: `#facc15`, **Danger**: `#ef4444`
- Soft shadows: `box-shadow: 0 4px 20px rgba(0,0,0,0.08)`

### Typography
- Font: Inter / Geist / Satoshi
- Headings: 28px, 600 weight
- Body: 16px, regular
- Code blocks: mono font, shaded background

### Buttons
- Primary = Indigo
- Secondary = Transparent with border
- Micro-hover transitions (`transform: scale(1.03)`)

---

## ✨ Animations & Feedback

- Agenda sections animate in with `fade + slide-up`
- Collaborative cursor indicator moves with easing
- Toast/snackbar messages for:
  - Voice command confirmations
  - Task assignments
  - Meeting created
- Loading states with skeletons
- Transcription progress bar animated
- On export success → confetti or pulse animation

---

## 📱 Responsive Design

- Mobile-first layout for Notes, Agenda, Tasks
- Bottom navigation bar on mobile
- Responsive TipTap + accordion behavior
- Mobile voice command and mic recorder always sticky at bottom

---

## 💡 UX Rules & Microcopy

- Use encouraging, non-robotic messages:  
  *“All set! Your agenda is ready.”*,  
  *“Nice! That action is on your list.”*,  
  *“Mic’s on. Say something smart.”*

- Every action should offer feedback. Never leave the user guessing.
- Autosave everything.
- Kiro AI responses should feel smart but non-intrusive—like a background assistant.

---

## 🔚 Summary

MeetingFlow should feel calm, intuitive, and powerful under the surface. Everything you see is thoughtful: less noise, more signal. It’s Notion + ChatGPT + Dropbox + Todoist—but smarter, lighter, and built for focused work.

This design doc is the foundation Kiro should follow for every page, element, and animation.

