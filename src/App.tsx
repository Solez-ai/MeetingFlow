import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ErrorBoundary, RouterErrorBoundary } from '@/components/layout/ErrorBoundary'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/components/Dashboard'
import { MeetingWorkspace } from '@/components/meeting/MeetingWorkspace'
import { Settings } from '@/components/settings/Settings'
import { ActionItemsPage } from '@/components/transcription/ActionItemsPage'
import { VoiceCommandProvider } from '@/components/voice/VoiceCommandProvider'
import { useMeetingStore } from '@/store/meetingStore'
import type { MeetingState } from '@/store/meetingStore'
import { Toaster } from '@/components/ui/toaster'
import { initConfetti } from '@/utils/confetti'
import { ApiKeyProvider } from '@/components/transcription/ApiKeyProvider'

// Create router with React Router v7 data router pattern
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'meeting/new',
        element: <MeetingWorkspace />,
      },
      {
        path: 'meeting/:id',
        element: <MeetingWorkspace />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'action-items',
        element: <ActionItemsPage />,
      },
    ],
  },
])

function App() {
  const initializeMeetings = useMeetingStore((state: MeetingState) => state.initializeMeetings)
  
  useEffect(() => {
    // Initialize meetings from localStorage on app start
    initializeMeetings()
    
    // Initialize confetti system
    initConfetti()
  }, [initializeMeetings])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <VoiceCommandProvider>
          <ApiKeyProvider />
          <RouterProvider router={router} />
          <Toaster />
        </VoiceCommandProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App