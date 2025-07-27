# MeetingFlow - AI-Powered Meeting Management

A modern, feature-rich meeting management application with AI assistance, real-time collaboration, and comprehensive productivity tools.

## 🚀 Features

### Core Meeting Management
- **Smart Agenda Creation** - Time-balanced agenda planning with drag-and-drop reordering
- **Real-time Note Taking** - Rich text editor with collaborative editing
- **Task Management** - Extract and track action items with priority levels
- **Live Transcription** - AssemblyAI-powered speech-to-text conversion

### AI Assistant (MeetingFlow Buddy)
- **Meeting Summaries** - AI-generated meeting summaries with key insights
- **Task Extraction** - Automatic identification of action items from meeting content
- **Q&A Support** - Ask questions about meeting content and get intelligent responses
- **Smart Reminders** - AI-suggested follow-up reminders and deadlines

### Collaboration Features
- **Real-time Collaboration** - Multiple users can edit simultaneously
- **Screen Sharing** - WebRTC-powered screen sharing capabilities
- **Voice Commands** - Hands-free meeting control
- **Shareable Links** - Easy meeting sharing with QR codes

### Productivity Tools
- **Export Options** - PDF, Word, and JSON export formats
- **Email Integration** - Send meeting summaries and action items
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode** - Customizable theme preferences

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenRouter API (Kimi K2 model)
- **Transcription**: AssemblyAI
- **Real-time**: WebRTC, Simple Peer
- **Build Tool**: Vite
- **Testing**: Vitest, Playwright

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd meetingflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_ASSEMBLYAI_API_KEY=your_assemblyai_key
   VITE_EMAILJS_USER_ID=your_emailjs_user_id
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 API Keys Setup

### AssemblyAI (Transcription)
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Add to `.env` as `VITE_ASSEMBLYAI_API_KEY`

### OpenRouter (AI Assistant)
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add to `.env` as `VITE_OPENROUTER_API_KEY`
4. The Kimi K2 model is free to use!

### EmailJS (Email Integration)
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create a service and template
3. Add your User ID, Service ID, and Template ID to `.env`

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard

### Deploy to Vercel
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📱 Usage

### Creating a Meeting
1. Click "New Meeting" on the dashboard
2. Add meeting title and duration
3. Create agenda items with time allocations
4. Start the meeting!

### Using AI Assistant
1. Configure your OpenRouter API key in Settings
2. Click the floating AI icon during meetings
3. Use quick actions or ask questions naturally
4. Get instant summaries and task extraction

### Collaboration
1. Share meeting link with participants
2. Enable real-time collaboration
3. Use voice commands for hands-free control
4. Share screens when needed

## 🔒 Privacy & Security

- **Local Storage**: Meeting data stored locally in your browser
- **API Security**: All API keys are stored securely
- **Privacy Controls**: Full control over AI data processing
- **No Tracking**: No user analytics or tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Advanced AI features
- [ ] Team workspaces
- [ ] Meeting analytics
- [ ] Custom AI prompts

---

**Made with ❤️ for productive meetings**