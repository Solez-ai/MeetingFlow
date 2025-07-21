# 🧠 MeetingFlow

> ✨ Privacy-First Meeting Productivity Tool  
> 📅 Capture, Transcribe, and Automate Meetings with AI

MeetingFlow is a modern meeting workspace that helps you manage your entire meeting workflow—from agenda planning to real-time transcription, collaborative note-taking, and task generation—without relying on a backend or external databases. The application runs entirely in the browser using LocalStorage, EmailJS, AssemblyAI, and Zustand for state management, providing a seamless, privacy-first meeting experience.

---

## 🚀 Tech Stack

| Layer        | Tech                      |
|--------------|---------------------------|
| Frontend     | **React 19**, **Vite**    |
| Styling      | **Tailwind CSS 4**, **ShadCN UI** |
| Transcription| **AssemblyAI**            |
| Email        | **EmailJS**               |
| State Mgmt   | **Zustand**               |
| Routing      | **React Router v7**       |
| Rich Editor  | **TipTap**                |
| Real-time Sync| **WebRTC** with simple-peer |
| Icons        | **Lucide Icons** / **Radix Icons** |
| Printing     | `react-to-print` (for export) |
| ID / UID     | `uuid`                    |
| Storage      | `localStorage` (no backend) |
| Linting      | ESLint + TypeScript       |

---

## 🧪 Features

- 📝 Create and manage **time-balanced meeting agendas**
- 📊 Take collaborative notes with a **Notion-style block editor**
- 🎙️ **Transcribe audio recordings** and extract action items automatically
- ✅ Manage tasks with **due dates, priorities, and reminders**
- 🗣️ Use **voice commands** to control the application hands-free
- 🔄 **Export meeting data** in multiple formats and share sessions
- 🔒 **Privacy-first**: All data stays on your device with no backend dependencies
- 📱 **Responsive design** that works across devices

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   VITE_EMAILJS_USER_ID=your_emailjs_user_id
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```
meetingflow/
├── public/            # Static assets
├── src/
│   ├── assets/        # Images and other assets
│   ├── components/    # React components
│   │   ├── agenda/    # Agenda-related components
│   │   ├── layout/    # Layout components
│   │   ├── notes/     # Notes editor components
│   │   ├── tasks/     # Task management components
│   │   ├── transcription/ # Transcription components
│   │   ├── ui/        # UI components (shadcn/ui)
│   │   └── voice/     # Voice command components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and constants
│   ├── services/      # Service classes for external APIs
│   ├── store/         # Zustand store
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main App component
│   └── main.tsx       # Entry point
├── .env               # Environment variables
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

---

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
