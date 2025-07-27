import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ErrorBoundary, RouterErrorBoundary, AsyncErrorBoundary, NetworkErrorBoundary } from '@/components/layout/ErrorBoundary'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/components/Dashboard'
import { MeetingWorkspace } from '@/components/meeting/MeetingWorkspace'
import { Settings } from '@/components/settings/Settings'
import { ActionItemsPage } from '@/components/transcription/ActionItemsPage'
import { VoiceCommandProvider } from '@/components/voice/VoiceCommandProvider'
import { useMeetingStore } from '@/store/meetingStore'
import type { MeetingState } from '@/store/meetingStore'
import { useShareableLink } from '@/hooks/useShareableLink'
import { Toaster } from '@/components/ui/toaster'
import { FeedbackContainer } from '@/components/ui/user-feedback'
import { GlobalLoadingIndicator } from '@/components/ui/loading-states'
import { BrowserCompatibilityChecker, NetworkStatus } from '@/components/ui/graceful-degradation'
import { initConfetti } from '@/utils/confetti'
import { ApiKeyProvider } from '@/components/transcription/ApiKeyProvider'
import { checkBrowserFeatures } from '@/utils/errorHandling'

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
  
  // Handle shareable links
  useShareableLink()
  
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize meetings from localStorage on app start
      initializeMeetings()
      
      // Initialize confetti system
      initConfetti()
      
      // Check browser feature compatibility
      checkBrowserFeatures()
      
      // Make feedback manager globally accessible for error handling
      const { feedbackManager } = await import('@/components/ui/user-feedback')
      ;(window as any).feedbackManager = feedbackManager
    }
    
    initializeApp()
  }, [initializeMeetings])

  return (
    <ErrorBoundary>
      <AsyncErrorBoundary>
        <NetworkErrorBoundary>
          <ThemeProvider>
            <VoiceCommandProvider>
              <BrowserCompatibilityChecker />
              <GlobalLoadingIndicator />
              <ApiKeyProvider />
              <RouterProvider router={router} />
              <Toaster />
              <FeedbackContainer />
            </VoiceCommandProvider>
          </ThemeProvider>
        </NetworkErrorBoundary>
      </AsyncErrorBoundary>
    </ErrorBoundary>
  )
}

export default App