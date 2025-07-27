/**
 * Comprehensive error handling utilities for MeetingFlow
 */

export interface AppError {
  id: string
  type: 'network' | 'storage' | 'webrtc' | 'voice' | 'validation' | 'unknown'
  message: string
  details?: string
  timestamp: string
  context?: string
  recoverable: boolean
  retryable: boolean
}

export interface ErrorRecoveryAction {
  label: string
  action: () => void | Promise<void>
  primary?: boolean
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []
  private maxLogSize = 100

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  private createError(
    type: AppError['type'],
    message: string,
    details?: string,
    context?: string,
    recoverable = true,
    retryable = false
  ): AppError {
    return {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      context,
      recoverable,
      retryable
    }
  }

  private logError(error: AppError): void {
    this.errorLog.unshift(error)
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }
    console.error(`[${error.type.toUpperCase()}] ${error.message}`, error)
  }

  private showToast(error: AppError, actions?: ErrorRecoveryAction[]): void {
    // Try to use the new feedback system first
    if (typeof window !== 'undefined' && (window as any).feedbackManager) {
      const feedbackManager = (window as any).feedbackManager
      const feedbackActions = actions?.map(action => ({
        label: action.label,
        action: action.action,
        primary: action.primary,
        variant: 'outline' as const
      }))

      if (error.type === 'network' || error.type === 'webrtc' || error.type === 'voice') {
        feedbackManager.warning(this.getErrorTitle(error.type), error.message, feedbackActions)
      } else {
        feedbackManager.error(this.getErrorTitle(error.type), error.message, feedbackActions)
      }
    } else {
      // Fallback to old toast system
      const event = new CustomEvent('toast', {
        detail: {
          title: this.getErrorTitle(error.type),
          description: error.message,
          variant: 'destructive',
          duration: error.recoverable ? 8000 : 12000,
          actions
        }
      })
      window.dispatchEvent(event)
    }
  }

  private getErrorTitle(type: AppError['type']): string {
    switch (type) {
      case 'network':
        return 'Connection Error'
      case 'storage':
        return 'Storage Error'
      case 'webrtc':
        return 'Collaboration Error'
      case 'voice':
        return 'Voice Recognition Error'
      case 'validation':
        return 'Validation Error'
      default:
        return 'Application Error'
    }
  }

  handleNetworkError(error: Error, context: string, retryFn?: () => Promise<void>): void {
    const appError = this.createError(
      'network',
      'Unable to connect to external service. Please check your internet connection.',
      error.message,
      context,
      true,
      !!retryFn
    )

    this.logError(appError)

    const actions: ErrorRecoveryAction[] = []
    if (retryFn) {
      actions.push({
        label: 'Retry',
        action: retryFn,
        primary: true
      })
    }

    this.showToast(appError, actions)
  }

  handleStorageError(error: Error, data?: any): void {
    const appError = this.createError(
      'storage',
      'Unable to save data locally. Your browser storage may be full.',
      error.message,
      data ? `Data: ${JSON.stringify(data).substring(0, 100)}...` : undefined,
      true,
      false
    )

    this.logError(appError)

    const actions: ErrorRecoveryAction[] = [
      {
        label: 'Clear Storage',
        action: () => {
          if (confirm('This will clear all local data. Are you sure?')) {
            localStorage.clear()
            window.location.reload()
          }
        }
      },
      {
        label: 'Export Data',
        action: () => {
          try {
            const allData = { ...localStorage }
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `meetingflow-backup-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
          } catch (e) {
            console.error('Failed to export data:', e)
          }
        },
        primary: true
      }
    ]

    this.showToast(appError, actions)
  }

  handleWebRTCError(error: Error, peerId?: string): void {
    const appError = this.createError(
      'webrtc',
      'Collaboration connection failed. You can continue working in offline mode.',
      error.message,
      peerId ? `Peer ID: ${peerId}` : undefined,
      true,
      true
    )

    this.logError(appError)

    const actions: ErrorRecoveryAction[] = [
      {
        label: 'Retry Connection',
        action: () => {
          // Trigger reconnection attempt
          window.dispatchEvent(new CustomEvent('webrtc-retry'))
        },
        primary: true
      },
      {
        label: 'Continue Offline',
        action: () => {
          // Switch to offline mode
          window.dispatchEvent(new CustomEvent('collaboration-offline'))
        }
      }
    ]

    this.showToast(appError, actions)
  }

  handleVoiceError(error: Error): void {
    const appError = this.createError(
      'voice',
      'Voice recognition is not available. You can use text input instead.',
      error.message,
      undefined,
      true,
      false
    )

    this.logError(appError)

    const actions: ErrorRecoveryAction[] = [
      {
        label: 'Use Text Input',
        action: () => {
          // Focus on text input alternative
          const textInput = document.querySelector('input[type="text"], textarea')
          if (textInput instanceof HTMLElement) {
            textInput.focus()
          }
        },
        primary: true
      }
    ]

    this.showToast(appError, actions)
  }

  handleValidationError(message: string, field?: string): void {
    const appError = this.createError(
      'validation',
      message,
      undefined,
      field ? `Field: ${field}` : undefined,
      true,
      false
    )

    this.logError(appError)
    this.showToast(appError)
  }

  handleUnknownError(error: Error, context?: string): void {
    const appError = this.createError(
      'unknown',
      'An unexpected error occurred. Please try refreshing the page.',
      error.message,
      context,
      false,
      false
    )

    this.logError(appError)

    const actions: ErrorRecoveryAction[] = [
      {
        label: 'Refresh Page',
        action: () => window.location.reload(),
        primary: true
      },
      {
        label: 'Report Issue',
        action: () => {
          const subject = encodeURIComponent('MeetingFlow Error Report')
          const body = encodeURIComponent(`Error Details:\n${JSON.stringify(appError, null, 2)}`)
          window.open(`mailto:support@meetingflow.com?subject=${subject}&body=${body}`)
        }
      }
    ]

    this.showToast(appError, actions)
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  clearErrorLog(): void {
    this.errorLog = []
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error scenarios
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R | Promise<R>,
  context: string,
  errorType: AppError['type'] = 'unknown'
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args)
    } catch (error) {
      switch (errorType) {
        case 'network':
          errorHandler.handleNetworkError(error as Error, context)
          break
        case 'storage':
          errorHandler.handleStorageError(error as Error)
          break
        case 'webrtc':
          errorHandler.handleWebRTCError(error as Error)
          break
        case 'voice':
          errorHandler.handleVoiceError(error as Error)
          break
        default:
          errorHandler.handleUnknownError(error as Error, context)
      }
      return undefined
    }
  }
}

// Graceful degradation helper
export const withGracefulDegradation = <T>(
  primaryFn: () => T | Promise<T>,
  fallbackFn: () => T | Promise<T>,
  context: string
) => {
  return async (): Promise<T> => {
    try {
      return await primaryFn()
    } catch (error) {
      console.warn(`Primary function failed in ${context}, falling back:`, error)
      try {
        return await fallbackFn()
      } catch (fallbackError) {
        errorHandler.handleUnknownError(fallbackError as Error, `${context} (fallback also failed)`)
        throw fallbackError
      }
    }
  }
}

// Feature availability checker
export class FeatureAvailability {
  private static instance: FeatureAvailability
  private featureStatus: Map<string, boolean> = new Map()

  static getInstance(): FeatureAvailability {
    if (!FeatureAvailability.instance) {
      FeatureAvailability.instance = new FeatureAvailability()
    }
    return FeatureAvailability.instance
  }

  checkFeature(featureName: string, checkFn: () => boolean): boolean {
    try {
      const isAvailable = checkFn()
      this.featureStatus.set(featureName, isAvailable)
      return isAvailable
    } catch (error) {
      console.warn(`Feature check failed for ${featureName}:`, error)
      this.featureStatus.set(featureName, false)
      return false
    }
  }

  isFeatureAvailable(featureName: string): boolean {
    return this.featureStatus.get(featureName) ?? false
  }

  getUnavailableFeatures(): string[] {
    return Array.from(this.featureStatus.entries())
      .filter(([, available]) => !available)
      .map(([feature]) => feature)
  }
}

export const featureAvailability = FeatureAvailability.getInstance()

// Check common browser features
export const checkBrowserFeatures = () => {
  featureAvailability.checkFeature('webrtc', () => {
    return !!(window.RTCPeerConnection || window.webkitRTCPeerConnection)
  })

  featureAvailability.checkFeature('speechRecognition', () => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })

  featureAvailability.checkFeature('mediaRecorder', () => {
    return !!window.MediaRecorder
  })

  featureAvailability.checkFeature('localStorage', () => {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  })

  featureAvailability.checkFeature('notifications', () => {
    return 'Notification' in window
  })

  featureAvailability.checkFeature('serviceWorker', () => {
    return 'serviceWorker' in navigator
  })
}

// Retry mechanism with exponential backoff
export class RetryManager {
  private static instance: RetryManager
  private retryAttempts: Map<string, number> = new Map()

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager()
    }
    return RetryManager.instance
  }

  async retry<T>(
    key: string,
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000
  ): Promise<T> {
    const attempts = this.retryAttempts.get(key) || 0
    
    try {
      const result = await fn()
      this.retryAttempts.delete(key) // Reset on success
      return result
    } catch (error) {
      if (attempts >= maxAttempts - 1) {
        this.retryAttempts.delete(key)
        throw error
      }

      this.retryAttempts.set(key, attempts + 1)
      const delay = baseDelay * Math.pow(2, attempts)
      
      console.warn(`Retry attempt ${attempts + 1}/${maxAttempts} for ${key} in ${delay}ms`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retry(key, fn, maxAttempts, baseDelay)
    }
  }

  getRetryCount(key: string): number {
    return this.retryAttempts.get(key) || 0
  }

  resetRetries(key: string): void {
    this.retryAttempts.delete(key)
  }
}

export const retryManager = RetryManager.getInstance()

// Enhanced error recovery actions
export interface EnhancedErrorRecoveryAction extends ErrorRecoveryAction {
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

// Circuit breaker pattern for failing services
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'closed'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }

  getState(): string {
    return this.state
  }
}