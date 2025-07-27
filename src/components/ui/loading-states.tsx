/**
 * Comprehensive loading states and progress indicators
 */

import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading"

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function LoadingState({ isLoading, children, fallback, className }: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        {fallback || <LoadingSpinner />}
      </div>
    )
  }
  return <>{children}</>
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  )
}

export function SkeletonMeetingCard() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  label?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  showLabel = false, 
  label 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  progress?: number
  className?: string
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Loading...", 
  progress,
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <p className="text-sm font-medium">{message}</p>
            {progress !== undefined && (
              <div className="mt-3 w-full">
                <ProgressBar value={progress} showLabel />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function InlineLoading({ size = 'sm', message, className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {message}
        </span>
      )}
    </div>
  )
}

interface ButtonLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function ButtonLoading({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  className 
}: ButtonLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{isLoading ? loadingText : children}</span>
    </div>
  )
}

// Specific loading states for different features
export function TranscriptionLoading() {
  return (
    <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
      <div className="relative">
        <LoadingSpinner size="md" />
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
      </div>
      <div>
        <p className="text-sm font-medium">Transcribing audio...</p>
        <p className="text-xs text-muted-foreground">This may take a few moments</p>
      </div>
    </div>
  )
}

export function CollaborationLoading() {
  return (
    <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
      <LoadingSpinner size="md" className="text-blue-600" />
      <div>
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Connecting to collaboration session...
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Establishing secure peer connection
        </p>
      </div>
    </div>
  )
}

export function VoiceRecognitionLoading() {
  return (
    <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
      <div className="relative">
        <LoadingSpinner size="md" className="text-green-600" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20" />
      </div>
      <div>
        <p className="text-sm font-medium text-green-900 dark:text-green-100">
          Listening for voice commands...
        </p>
        <p className="text-xs text-green-600 dark:text-green-400">
          Speak clearly into your microphone
        </p>
      </div>
    </div>
  )
}

interface DataLoadingProps {
  type: 'meetings' | 'tasks' | 'notes' | 'transcripts'
  count?: number
}

export function DataLoading({ type, count }: DataLoadingProps) {
  const messages = {
    meetings: 'Loading your meetings...',
    tasks: 'Loading tasks...',
    notes: 'Loading notes...',
    transcripts: 'Loading transcripts...'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="md" />
        <p className="text-sm font-medium">{messages[type]}</p>
      </div>
      {count && count > 0 && (
        <div className="space-y-2">
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// Enhanced loading state manager
export class LoadingStateManager {
  private static instance: LoadingStateManager
  private loadingStates: Map<string, boolean> = new Map()
  private listeners: Map<string, ((isLoading: boolean) => void)[]> = new Map()

  static getInstance(): LoadingStateManager {
    if (!LoadingStateManager.instance) {
      LoadingStateManager.instance = new LoadingStateManager()
    }
    return LoadingStateManager.instance
  }

  private notify(key: string, isLoading: boolean) {
    const listeners = this.listeners.get(key) || []
    listeners.forEach(listener => listener(isLoading))
  }

  setLoading(key: string, isLoading: boolean) {
    this.loadingStates.set(key, isLoading)
    this.notify(key, isLoading)
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false
  }

  subscribe(key: string, listener: (isLoading: boolean) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(listener)

    return () => {
      const listeners = this.listeners.get(key) || []
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  getActiveLoadingStates(): string[] {
    return Array.from(this.loadingStates.entries())
      .filter(([, isLoading]) => isLoading)
      .map(([key]) => key)
  }
}

export const loadingStateManager = LoadingStateManager.getInstance()

// React hook for loading states
export function useLoadingState(key: string) {
  const [isLoading, setIsLoading] = useState(loadingStateManager.isLoading(key))

  useEffect(() => {
    return loadingStateManager.subscribe(key, setIsLoading)
  }, [key])

  const setLoading = (loading: boolean) => {
    loadingStateManager.setLoading(key, loading)
  }

  return [isLoading, setLoading] as const
}

// Global loading indicator
export function GlobalLoadingIndicator() {
  const [activeStates, setActiveStates] = useState<string[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStates(loadingStateManager.getActiveLoadingStates())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (activeStates.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary/10 border-b border-primary/20">
      <div className="flex items-center justify-center py-2 px-4">
        <LoadingSpinner size="sm" className="mr-2" />
        <span className="text-sm text-primary">
          {activeStates.length === 1 
            ? `Loading ${activeStates[0]}...`
            : `Loading ${activeStates.length} items...`
          }
        </span>
      </div>
    </div>
  )
}

// Smart loading wrapper that handles errors
interface SmartLoadingWrapperProps {
  isLoading: boolean
  error?: Error | null
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  onRetry?: () => void
  emptyState?: React.ReactNode
  isEmpty?: boolean
}

export function SmartLoadingWrapper({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  onRetry,
  emptyState,
  isEmpty = false
}: SmartLoadingWrapperProps) {
  if (error) {
    return errorComponent || (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isEmpty && emptyState) {
    return emptyState
  }

  return <>{children}</>
}