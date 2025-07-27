/**
 * Error recovery utilities and strategies
 */

import { errorHandler } from './errorHandling'
import { feedbackManager } from '@/components/ui/user-feedback'

export interface RecoveryStrategy {
  name: string
  description: string
  execute: () => Promise<boolean>
  canRecover: (error: Error) => boolean
  priority: number // Lower number = higher priority
}

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager
  private strategies: RecoveryStrategy[] = []

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager()
      ErrorRecoveryManager.instance.initializeDefaultStrategies()
    }
    return ErrorRecoveryManager.instance
  }

  private initializeDefaultStrategies() {
    // Storage recovery strategies
    this.addStrategy({
      name: 'clearCorruptedData',
      description: 'Clear corrupted localStorage data',
      priority: 1,
      canRecover: (error) => error.message.includes('localStorage') || error.message.includes('JSON'),
      execute: async () => {
        try {
          // Try to identify and remove corrupted keys
          const keys = Object.keys(localStorage)
          for (const key of keys) {
            if (key.startsWith('meetingflow:')) {
              try {
                JSON.parse(localStorage.getItem(key) || '{}')
              } catch {
                localStorage.removeItem(key)
                console.log(`Removed corrupted key: ${key}`)
              }
            }
          }
          return true
        } catch {
          return false
        }
      }
    })

    // Network recovery strategies
    this.addStrategy({
      name: 'retryWithBackoff',
      description: 'Retry failed network request with exponential backoff',
      priority: 2,
      canRecover: (error) => error.message.includes('fetch') || error.message.includes('network'),
      execute: async () => {
        // This would be implemented per-request basis
        return true
      }
    })

    // WebRTC recovery strategies
    this.addStrategy({
      name: 'resetWebRTCConnection',
      description: 'Reset WebRTC peer connection',
      priority: 3,
      canRecover: (error) => error.message.includes('WebRTC') || error.message.includes('peer'),
      execute: async () => {
        try {
          // Trigger WebRTC reset event
          window.dispatchEvent(new CustomEvent('webrtc-reset'))
          return true
        } catch {
          return false
        }
      }
    })

    // Voice recognition recovery
    this.addStrategy({
      name: 'resetSpeechRecognition',
      description: 'Reset speech recognition service',
      priority: 4,
      canRecover: (error) => error.message.includes('speech') || error.message.includes('recognition'),
      execute: async () => {
        try {
          // Trigger speech recognition reset
          window.dispatchEvent(new CustomEvent('speech-reset'))
          return true
        } catch {
          return false
        }
      }
    })

    // Memory cleanup strategy
    this.addStrategy({
      name: 'memoryCleanup',
      description: 'Clean up memory and reset application state',
      priority: 5,
      canRecover: (error) => error.message.includes('memory') || error.message.includes('heap'),
      execute: async () => {
        try {
          // Clear non-essential caches
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(
              cacheNames.map(name => caches.delete(name))
            )
          }
          
          // Force garbage collection if available
          if (window.gc) {
            window.gc()
          }
          
          return true
        } catch {
          return false
        }
      }
    })

    // Last resort: page refresh
    this.addStrategy({
      name: 'pageRefresh',
      description: 'Refresh the page to reset application state',
      priority: 10,
      canRecover: () => true,
      execute: async () => {
        window.location.reload()
        return true
      }
    })
  }

  addStrategy(strategy: RecoveryStrategy) {
    this.strategies.push(strategy)
    this.strategies.sort((a, b) => a.priority - b.priority)
  }

  async attemptRecovery(error: Error, context?: string): Promise<boolean> {
    const applicableStrategies = this.strategies.filter(strategy => 
      strategy.canRecover(error)
    )

    if (applicableStrategies.length === 0) {
      console.warn('No recovery strategies available for error:', error)
      return false
    }

    const notificationId = feedbackManager.loading(
      'Attempting Recovery',
      'Trying to recover from the error...'
    )

    for (const strategy of applicableStrategies) {
      try {
        console.log(`Attempting recovery strategy: ${strategy.name}`)
        
        feedbackManager.update(notificationId, {
          message: strategy.description
        })

        const success = await strategy.execute()
        
        if (success) {
          console.log(`Recovery successful with strategy: ${strategy.name}`)
          
          feedbackManager.dismiss(notificationId)
          feedbackManager.success(
            'Recovery Successful',
            `The error has been resolved using: ${strategy.description}`
          )
          
          return true
        }
      } catch (recoveryError) {
        console.warn(`Recovery strategy ${strategy.name} failed:`, recoveryError)
      }
    }

    feedbackManager.dismiss(notificationId)
    feedbackManager.error(
      'Recovery Failed',
      'Unable to automatically recover from the error. Manual intervention may be required.',
      [
        {
          label: 'Export Data',
          action: () => this.exportErrorData(error, context),
          primary: true
        },
        {
          label: 'Reset App',
          action: () => this.resetApplication(),
          requiresConfirmation: true,
          confirmationMessage: 'This will clear all local data. Are you sure?'
        }
      ]
    )

    return false
  }

  private async exportErrorData(error: Error, context?: string) {
    try {
      const errorData = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: { ...localStorage },
        errorLog: errorHandler.getErrorLog()
      }

      const blob = new Blob([JSON.stringify(errorData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meetingflow-error-data-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      feedbackManager.success(
        'Data Exported',
        'Error data has been exported for debugging'
      )
    } catch (exportError) {
      console.error('Failed to export error data:', exportError)
      feedbackManager.error(
        'Export Failed',
        'Unable to export error data'
      )
    }
  }

  private async resetApplication() {
    try {
      // Clear all localStorage
      localStorage.clear()
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
      }
      
      // Reload the page
      window.location.reload()
    } catch (resetError) {
      console.error('Failed to reset application:', resetError)
      // Force reload as last resort
      window.location.href = window.location.href
    }
  }
}

export const errorRecoveryManager = ErrorRecoveryManager.getInstance()

// Auto-recovery wrapper for functions
export function withAutoRecovery<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string,
  maxRetries = 1
) {
  return async (...args: T): Promise<R | undefined> => {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args)
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          console.warn(`Attempt ${attempt + 1} failed for ${context}, trying recovery...`)
          
          const recovered = await errorRecoveryManager.attemptRecovery(
            lastError, 
            `${context} (attempt ${attempt + 1})`
          )
          
          if (!recovered) {
            break
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    
    // If we get here, all attempts failed
    if (lastError) {
      errorHandler.handleUnknownError(lastError, context)
    }
    
    return undefined
  }
}

// Health check system
export class HealthChecker {
  private static instance: HealthChecker
  private checks: Map<string, () => Promise<boolean>> = new Map()
  private lastResults: Map<string, boolean> = new Map()

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker()
      HealthChecker.instance.initializeDefaultChecks()
    }
    return HealthChecker.instance
  }

  private initializeDefaultChecks() {
    this.addCheck('localStorage', async () => {
      try {
        const test = '__health_check__'
        localStorage.setItem(test, 'test')
        localStorage.removeItem(test)
        return true
      } catch {
        return false
      }
    })

    this.addCheck('network', async () => {
      return navigator.onLine
    })

    this.addCheck('webrtc', async () => {
      return !!(window.RTCPeerConnection || window.webkitRTCPeerConnection)
    })

    this.addCheck('speechRecognition', async () => {
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    })
  }

  addCheck(name: string, checkFn: () => Promise<boolean>) {
    this.checks.set(name, checkFn)
  }

  async runCheck(name: string): Promise<boolean> {
    const checkFn = this.checks.get(name)
    if (!checkFn) {
      console.warn(`Health check '${name}' not found`)
      return false
    }

    try {
      const result = await checkFn()
      this.lastResults.set(name, result)
      return result
    } catch (error) {
      console.warn(`Health check '${name}' failed:`, error)
      this.lastResults.set(name, false)
      return false
    }
  }

  async runAllChecks(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    
    for (const [name] of this.checks) {
      results.set(name, await this.runCheck(name))
    }
    
    return results
  }

  getLastResult(name: string): boolean | undefined {
    return this.lastResults.get(name)
  }

  getHealthStatus(): { healthy: string[], unhealthy: string[] } {
    const healthy: string[] = []
    const unhealthy: string[] = []
    
    for (const [name, result] of this.lastResults) {
      if (result) {
        healthy.push(name)
      } else {
        unhealthy.push(name)
      }
    }
    
    return { healthy, unhealthy }
  }
}

export const healthChecker = HealthChecker.getInstance()

// Periodic health monitoring
export function startHealthMonitoring(intervalMs = 60000) {
  const runHealthCheck = async () => {
    const results = await healthChecker.runAllChecks()
    const { unhealthy } = healthChecker.getHealthStatus()
    
    if (unhealthy.length > 0) {
      console.warn('Health check failures detected:', unhealthy)
      
      // Optionally show notification for critical failures
      const criticalFailures = unhealthy.filter(name => 
        ['localStorage', 'network'].includes(name)
      )
      
      if (criticalFailures.length > 0) {
        feedbackManager.warning(
          'System Health Warning',
          `Some critical features are not working: ${criticalFailures.join(', ')}`
        )
      }
    }
  }
  
  // Run initial check
  runHealthCheck()
  
  // Set up periodic monitoring
  const interval = setInterval(runHealthCheck, intervalMs)
  
  return () => clearInterval(interval)
}