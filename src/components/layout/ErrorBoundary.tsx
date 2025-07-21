import { Component, ErrorInfo, ReactNode } from 'react'
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Button } from '../ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// Router Error Component for React Router v7
export function RouterErrorBoundary() {
  const error = useRouteError()
  
  let errorMessage: string
  let errorStatus: number | undefined
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'An error occurred'
    errorStatus = error.status
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = 'Unknown error occurred'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md p-8 rounded-lg shadow-lg bg-card">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          {errorStatus ? `Error ${errorStatus}` : 'Something went wrong'}
        </h2>
        <p className="text-card-foreground mb-4">
          {errorStatus === 404 
            ? 'The page you are looking for does not exist.'
            : 'An error occurred while loading this page.'
          }
        </p>
        <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-48 mb-4">
          {errorMessage}
        </pre>
        <div className="flex gap-2">
          <Link to="/">
            <Button variant="default">
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  )
}

// React Error Boundary for component errors
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md p-8 rounded-lg shadow-lg bg-card">
            <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
            <p className="text-card-foreground mb-4">
              An error occurred in the application. Please try refreshing the page.
            </p>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-48 mb-4">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}