import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ErrorBoundary, RouterErrorBoundary } from '@/components/layout/ErrorBoundary'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { ToastProvider } from '@/components/layout/ToastProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/components/Dashboard'
import { MeetingWorkspace } from '@/components/meeting/MeetingWorkspace'
import { Settings } from '@/components/settings/Settings'
import { useMeetingStore } from '@/store/meetingStore'

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
    ],
  },
])

function App() {
  const initializeMeetings = useMeetingStore(state => state.initializeMeetings)
  
  useEffect(() => {
    // Initialize meetings from localStorage on app start
    initializeMeetings()
  }, [initializeMeetings])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
