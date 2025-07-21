# MeetingFlow — AI-Powered Meeting Assistant (WebsiteInfo)

## 🎯 What Kiro Should Do:
- Integrate specs, hooks, and steering per `.kiro/` directory: **Agenda**, **Transcript**, **Task**, **Export**.
- Support the **Productivity & Workflow** category (must match Devpost track) :contentReference[oaicite:1]{index=1}.
- Ensure the app starts without any backend; all data must rely on **LocalStorage**, WebRTC, client-side APIs, EmailJS, AssemblyAI.
- Build clearly labeled UI elements: **New Meeting**, **Agenda**, **Notes**, **Tasks**, **Export**, **Collaborate**, **Voice Commands**, etc.
- Use **EmailJS** public key only, never commit private keys.
- Use **AssemblyAI** free‐tier transcription.
- Use **TipTap rich‐block editor** with checkboxes, headings, todos.
- Use **react-to-print** and **react-markdown** or TipTap Markdown for exports.
- Include **voice commands** using Web Speech API to add topics, tasks, record.
- Include **WebRTC collaboration** with peer-to-peer sync.
- Automatically generate email reminders via EmailJS on task due or action items.
- Support shareable link exporting full JSON state encoded in URL.
- Follow Kiro’s spec-first development flow: `.kiro/specs/`, `.kiro/hooks/`, `.kiro/steering/` for each feature :contentReference[oaicite:2]{index=2}.
- Provide public repo with `.kiro/`, open-source license, and demonstration video per submission rules :contentReference[oaicite:3]{index=3}.
- Submission must be in English with README and Devpost text description.

## 🚫 What Kiro Should **Not** Do:
- Do **not** use any backend, database, or cloud service (Firebase, Supabase, etc.).
- Do **not** ignore `.kiro/` directory—must be included and **not in `.gitignore`** :contentReference[oaicite:4]{index=4}.
- Do **not** include private API keys in frontend or repo.
- Do **not** reuse or lightly repackage existing solutions—must be substantially different if previously started :contentReference[oaicite:5]{index=5}.
- Do **not** submit without:
  - Presence of `.kiro/` directory at root
  - Video ≤ 3 minutes answering spec-to-code, agent hooks, dev workflow prompts :contentReference[oaicite:6]{index=6}
  - Public GitHub URL + OSI license + category selection + Devpost writeup :contentReference[oaicite:7]{index=7}.

## 🧩 Feature & UI Mapping:
- **New Meeting** → opens form for title, duration, topics (text or voice).
- **Generate Agenda** → runs Kiro spec, populates left sidebar.
- **Notes Editor** → center panel with TipTap blocks, autosave.
- **Collaborate** → activate WebRTC P2P sync, share ID/link.
- **Audio Upload / Live Mic** → triggers AssemblyAI and transcription extraction.
- **Convert to Task** → highlight to‑do or action, send to task manager.
- **Tasks** → separate page: list, filter, due dates, priorities.
- **Completing Tasks** → sends reminder emails.
- **Export** → dropdown: PDF (react-to-print), Markdown, shareable link.
- **Voice Commands** → mic button listens for defined commands.
- **Settings** → reset data, clear localStorage.


