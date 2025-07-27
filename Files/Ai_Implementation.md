## Where and How MeetingFlow Buddy Will Sit in the App & UI Behavior

### Placement

MeetingFlow Buddy will appear as a floating, persistent **AI Assistant Icon** anchored at the bottom-right corner of the MeetingFlow interface. This location is ideal because:

- It’s easily accessible without blocking main content.
- Users naturally look there for chat/help assistants (common UI pattern).
- It stays visible but unobtrusive during all meeting workflows.

---

### Appearance & Animations

#### Initial State

- The AI Assistant Icon Image Can be Found in meetingflow\public\chatbot-chat-message-vectorart_78370-4104-Photoroom.png --> Path
- Its Backgorund Will be White Circle
- It will have a subtle pulse or glow animation to gently attract attention without being distracting.
- On hover, the icon will slightly enlarge (scale up by ~10%) and show a tooltip:  
  _"Meet MeetingFlow Buddy: AI assistant to summarize meetings & more."_

#### On Click

- When clicked, the icon smoothly **expands** into a chat panel sliding up from the bottom-right corner.
- The expansion animation uses easing curves for smooth acceleration and deceleration (e.g., cubic-bezier) and takes around 300ms.
- The panel overlay will softly darken the rest of the screen with a semi-transparent backdrop to focus user attention without fully blocking interaction with the underlying app if needed.

## How and Where to Add the AI

The AI integration will be implemented on the client-side within MeetingFlow’s TypeScript React frontend and optionally enhanced by a lightweight backend for token security if desired.

- **Core API integration**: The AI will be accessed via HTTP POST requests to OpenRouter’s chat completions endpoint, using the Kimi K2 model.
- **Where**: The API calls will be triggered when the user requests meeting summaries, task extraction, or interacts with the AI chat UI.
- **How**: Using the Fetch API in TypeScript, MeetingFlow will send meeting transcripts or queries as prompts to the AI, then receive and render responses in the interface.

request (With My API Key Filled in):

```ts
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "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",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "moonshotai/kimi-k2:free",
    messages: [
      { role: "system", content: "You are MeetingFlow Buddy, an AI assistant." },
      { role: "user", content: "Summarize the following meeting transcript:\n\n" + transcript }
    ]
  })
});

#### Chat Panel UI

- The panel contains:
  - A header with "MeetingFlow Buddy" label and a close (X) button.
  - Scrollable chat area with messages from user and AI.
  - Input box with send button and quick-action buttons ("Summarize Meeting," "Extract Tasks").
- As new messages arrive, the chat area auto-scrolls with a subtle fade-in effect for incoming messages.
- When the panel closes (X button or clicking outside), it collapses back to the floating icon with a reverse sliding animation.

## How MeetingFlow Buddy AI Should Be Used & How It Will Be Coded

### Purpose & Use Cases

MeetingFlow Buddy is designed to be the user’s AI-powered meeting assistant, helping to:

- **Summarize meeting notes:** Automatically generate concise, clear summaries from raw meeting content.
- **Extract action items & tasks:** Identify and list actionable tasks or decisions from conversations.
- **Answer user questions:** Respond to queries about the meeting content, agenda, or general workflow.
- **Provide reminders:** Notify users about upcoming deadlines or follow-ups related to meeting topics.
- **Assist with collaboration:** Help clarify points, suggest next steps, or provide guidance based on meeting context.

This AI companion enhances productivity by reducing manual effort in note-taking, tracking, and meeting follow-up.

---

### How Users Will Interact With It

- Users click the MeetingFlow Buddy icon to open the chat panel.
- They can type or speak questions or commands like:
  - "Summarize today’s meeting."
  - "What are the key action items?"
  - "Remind me to follow up with John next week."
- The AI replies in conversational language, presenting summaries, task lists, or reminders.
- Users can request AI-generated meeting agenda parsing or content-based suggestions.
- The assistant supports iterative conversation — users can clarify or ask follow-ups.

---

### How It Will Be Coded & Integrated

#### 1. **Backend AI API Integration**

- Use OpenRouter API with the Kimi K2 model 
- API calls send user messages and meeting data context to the model.
- Example flow:
  - When user requests a summary, MeetingFlow sends the raw meeting notes or relevant JSON data to the AI endpoint.
  - The AI returns a structured summary or extracted tasks.
- The system handles retries, error handling, and respects rate limits.

#### 2. **Context Management**

- MeetingFlow maintains the meeting state and recent conversation history.
- On each API call, it includes relevant meeting data (agenda, notes, participant info) as context to help AI generate accurate responses.
- Use JSON serialization to send structured content (like meeting deltas, agenda items) so the AI can parse meaningfully.

#### 3. **Frontend Chat Interface**

- The chat panel UI sends user input to a local handler.
- The handler calls the AI backend, waits for responses, and renders them in the chat window.
- Supports loading spinners or typing indicators for smooth UX.

#### 4. **Feature-Specific Code Modules**

- **Summary Generator:** Calls AI with prompts tailored to produce concise meeting summaries.
- **Task Extractor:** Uses specialized prompts asking the AI to extract action items and deadlines.
- **Reminder Scheduler:** Integrates AI output with MeetingFlow’s reminder system to trigger notifications.
- **Q&A Handler:** Processes user queries by sending relevant meeting data plus the question for AI contextual answers.

#### 5. **Prompt Engineering**

- Carefully craft prompts to instruct AI on style, tone, and output format.
- For example, prompt to generate bullet-point summaries or JSON lists of tasks.
- Use system messages to set AI role as “MeetingFlow Buddy, an assistant that helps users manage meetings efficiently.”

#### 6. **Security and Privacy**

- Ensure API keys are securely stored (server-side or environment variables).
- Avoid sending sensitive data without user consent.
- Optionally allow users to disable AI features.

---

### How Kiro Can Help

- Kiro can generate boilerplate code snippets to call OpenRouter’s API correctly with fetch or axios.
- It can help write the prompt templates for various AI tasks.
- Kiro can assist in building the chat UI components with React or the chosen frontend framework.
- It can generate TypeScript types for API responses and state management.
- Kiro can help write state logic to handle chat conversation, loading states, and error handling.
- It can suggest best practices for asynchronous API calls and UI animations.
- By feeding Kiro with your meeting data schema and UX goals, you get customized code for meeting summaries, task extraction, and reminders — speeding up development massively.

---

### Summary

MeetingFlow Buddy is an AI-powered assistant deeply integrated with the meeting data and user workflows. It’s coded by combining smart prompt engineering, backend API calls to free/open AI models, and intuitive frontend chat UI. With Kiro’s help, you can rapidly scaffold the entire AI feature — from API integration to frontend interaction — ensuring a seamless, valuable AI experience that boosts user productivity and engagement.

---

### Additional UI/UX Details

- The AI icon should have a **notification badge** (e.g., a small dot) when new AI insights or reminders are available, prompting users to check.
- The floating icon and chat panel will be **mobile-responsive**, adjusting size and placement for smaller screens without blocking essential controls.
- Use **accessible color contrast** and keyboard navigation support for usability.

---

### Summary

MeetingFlow Buddy’s UI presence is designed to be:

- **Visible but subtle**: floating icon with gentle animation draws attention.
- **Seamlessly integrated**: expands smoothly into an overlay chat without jarring transitions.
- **User-friendly**: quick tooltips, notifications, and responsive design ensure ease of use across devices.
- **Non-intrusive**: users control when and how they interact with the AI.

This thoughtful design keeps MeetingFlow Buddy always available as a helpful companion without interrupting user focus or flow.
