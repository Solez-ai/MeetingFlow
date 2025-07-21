import { BrowserRouter as Router } from 'react-router-dom'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { AppRoutes } from '@/components/layout/AppRoutes'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { ToastProvider } from '@/components/layout/ToastProvider'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
