import { Component, ErrorInfo, ReactNode, useState } from 'react'
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AlertTriangle, Home, RefreshCw, Download, Bug } from 'lucide-react'
import { errorHandler } from '@/utils/errorHandling'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

// Router Error Component for React Router v7
export function RouterErrorBoundary() {
  const error = useRouteError()
  const [showDetails, setShowDetails] = useState(false)
  
  let errorMessage: string
  let errorStatus: number | undefined
  let isRecoverable = true
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'An error occurred'
    errorStatus = error.status
    isRecoverable = errorStatus !== 404
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = 'Unknown error occurred'
  }

  const handleExportErrorLog = () => {
    try {
      const errorLog = errorHandler.getErrorLog()
      const errorData = {
        routerError: {
          message: errorMessage,
          status: errorStatus,
          timestamp: new Date().toISOString()
        },
        errorLog,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meetingflow-error-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to export error log:', e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {errorStatus ? `Error ${errorStatus}` : 'Something went wrong'}
          </CardTitle>
          <CardDescription>
            {errorStatus === 404 
              ? 'The page you are looking for does not exist.'
              : 'An error occurred while loading this page.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Error Details:</p>
              <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                {errorMessage}
              </pre>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Link to="/" className="flex-1">
                <Button variant="default" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              {isRecoverable && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1"
              >
                <Bug className="mr-2 h-4 w-4" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportErrorLog}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Log
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// React Error Boundary for component errors
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    this.setState({
      errorInfo
    })

    // Log error to our error handler
    errorHandler.handleUnknownError(error, 'React Error Boundary')
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleAutoRetry = (): void => {
    this.retryTimeoutId = window.setTimeout(() => {
      this.handleRetry()
    }, 3000)
  }

  handleExportErrorDetails = (): void => {
    try {
      const errorData = {
        error: {
          message: this.state.error?.message,
          stack: this.state.error?.stack,
          name: this.state.error?.name
        },
        errorInfo: this.state.errorInfo,
        retryCount: this.state.retryCount,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorLog: errorHandler.getErrorLog()
      }
      
      const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meetingflow-component-error-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to export error details:', e)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const canRetry = this.state.retryCount < 3
      const isNetworkError = this.state.error?.message.includes('fetch') || 
                            this.state.error?.message.includes('network')

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {isNetworkError 
                  ? 'A network error occurred. Please check your connection.'
                  : 'An unexpected error occurred in this part of the application.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Error:</p>
                <p className="text-xs text-muted-foreground">
                  {this.state.error?.message || 'Unknown error'}
                </p>
                {this.state.retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Retry attempts: {this.state.retryCount}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      variant="default"
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  )}
                  <Button
                    onClick={() => window.location.reload()}
                    variant={canRetry ? "outline" : "default"}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Page
                  </Button>
                </div>
                
                {canRetry && isNetworkError && (
                  <Button
                    onClick={this.handleAutoRetry}
                    variant="ghost"
                    size="sm"
                  >
                    Auto-retry in 3 seconds
                  </Button>
                )}
                
                <Button
                  onClick={this.handleExportErrorDetails}
                  variant="ghost"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Error Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different features
export function FeatureErrorBoundary({ 
  children, 
  featureName,
  fallbackComponent,
  enableRetry = true,
  enableGracefulDegradation = true
}: { 
  children: ReactNode
  featureName: string
  fallbackComponent?: ReactNode
  enableRetry?: boolean
  enableGracefulDegradation?: boolean
}) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (retryCount >= 3) return
    
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsRetrying(false)
    // Force re-render by updating key
    window.location.reload()
  }

  const defaultFallback = (
    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {featureName} Error
        </p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {enableGracefulDegradation 
          ? 'This feature is temporarily unavailable. Other parts of the app should still work.'
          : 'This feature encountered an error and needs to be refreshed.'
        }
      </p>
      {retryCount > 0 && (
        <p className="text-xs text-muted-foreground mb-2">
          Retry attempts: {retryCount}/3
        </p>
      )}
      <div className="flex gap-2">
        {enableRetry && retryCount < 3 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </>
            )}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      fallback={fallbackComponent || defaultFallback}
      onError={(error) => {
        errorHandler.handleUnknownError(error, `${featureName} Feature`)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ 
  children,
  onError
}: {
  children: ReactNode
  onError?: (error: Error) => void
}) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      
      errorHandler.handleUnknownError(error, 'Unhandled Promise Rejection')
      onError?.(error)
      
      // Prevent the default browser behavior
      event.preventDefault()
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [onError])

  return <>{children}</>
}

// Network-aware error boundary
export function NetworkErrorBoundary({ 
  children,
  fallback
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return fallback || (
      <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            No Internet Connection
          </p>
        </div>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-3">
          You're currently offline. Some features may not work properly.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          Check Connection
        </Button>
      </div>
    )
  }

  return <>{children}</>
}