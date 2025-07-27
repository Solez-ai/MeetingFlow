import { useEffect, lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ErrorBoundary, RouterErrorBoundary, AsyncErrorBoundary, NetworkErrorBoundary } from '@/components/layout/ErrorBoundary'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { VoiceCommandProvider } from '@/components/voice/VoiceCommandProvider'
import { useMeetingStore } from '@/store/meetingStore'
import type { MeetingState } from '@/store/meetingStore'
import { useShareableLink } from '@/hooks/useShareableLink'
import { Toaster } from '@/components/ui/toaster'
import { FeedbackContainer } from '@/components/ui/user-feedback'
import { GlobalLoadingIndicator } from '@/components/ui/loading-states'
import { BrowserCompatibilityChecker } from '@/components/ui/graceful-degradation'
import { initConfetti } from '@/utils/confetti'
import { ApiKeyProvider } from '@/components/transcription/ApiKeyProvider'
import { checkBrowserFeatures } from '@/utils/errorHandling'
import { ComponentLoadingSpinner } from '@/components/ui/loading-states'
import { initializePerformanceMonitoring } from '@/utils/performance'
import { initializeStorageMonitoring } from '@/utils/storage'
import { PerformanceMonitor } from '@/components/ui/performance-wrapper'
import { AIAssistant } from '@/components/ai/AIAssistant'

// Lazy load heavy components for code splitting
const Dashboard = lazy(() => import('@/components/Dashboard').then(module => ({ default: module.Dashboard })))
const MeetingWorkspace = lazy(() => import('@/components/meeting/MeetingWorkspace').then(module => ({ default: module.MeetingWorkspace })))
const Settings = lazy(() => import('@/components/settings/Settings').then(module => ({ default: module.Settings })))
const ActionItemsPage = lazy(() => import('@/components/transcription/ActionItemsPage').then(module => ({ default: module.ActionItemsPage })))

// Create router with React Router v7 data router pattern and lazy loading
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<ComponentLoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'meeting/new',
        element: (
          <Suspense fallback={<ComponentLoadingSpinner />}>
            <MeetingWorkspace />
          </Suspense>
        ),
      },
      {
        path: 'meeting/:id',
        element: (
          <Suspense fallback={<ComponentLoadingSpinner />}>
            <MeetingWorkspace />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<ComponentLoadingSpinner />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: 'action-items',
        element: (
          <Suspense fallback={<ComponentLoadingSpinner />}>
            <ActionItemsPage />
          </Suspense>
        ),
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
      
      // Initialize performance monitoring
      initializePerformanceMonitoring()
      
      // Initialize storage monitoring
      initializeStorageMonitoring()
      
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
              <PerformanceMonitor />
              <AIAssistant />
            </VoiceCommandProvider>
          </ThemeProvider>
        </NetworkErrorBoundary>
      </AsyncErrorBoundary>
    </ErrorBoundary>
  )
}

export default App