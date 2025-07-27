/**
 * Comprehensive notification system for user feedback
 */

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void | Promise<void>
    variant?: 'default' | 'outline' | 'ghost'
  }>
}

interface NotificationItemProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.persistent])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
    }
  }

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out",
        getBackgroundColor(),
        isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {notification.message}
              </p>
            )}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={async () => {
                      try {
                        await action.action()
                        if (!notification.persistent) {
                          handleDismiss()
                        }
                      } catch (error) {
                        console.error('Notification action failed:', error)
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }
    
    setNotifications(prev => [...prev, newNotification])
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Omit<Notification, 'id'>>
      addNotification(customEvent.detail)
    }

    window.addEventListener('notification', handleNotification)
    return () => window.removeEventListener('notification', handleNotification)
  }, [])

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 pointer-events-none">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  )
}

// Utility functions for showing notifications
export const showNotification = (notification: Omit<Notification, 'id'>) => {
  window.dispatchEvent(new CustomEvent('notification', { detail: notification }))
}

export const showSuccess = (title: string, message?: string, actions?: Notification['actions']) => {
  showNotification({ type: 'success', title, message, actions })
}

export const showError = (title: string, message?: string, actions?: Notification['actions']) => {
  showNotification({ 
    type: 'error', 
    title, 
    message, 
    actions,
    duration: 8000 // Longer duration for errors
  })
}

export const showWarning = (title: string, message?: string, actions?: Notification['actions']) => {
  showNotification({ type: 'warning', title, message, actions })
}

export const showInfo = (title: string, message?: string, actions?: Notification['actions']) => {
  showNotification({ type: 'info', title, message, actions })
}

// Specialized notifications for common scenarios
export const showSaveSuccess = () => {
  showSuccess('Saved successfully', 'Your changes have been saved automatically.')
}

export const showSaveError = (retryFn?: () => void) => {
  showError(
    'Save failed',
    'Unable to save your changes. Please try again.',
    retryFn ? [{ label: 'Retry', action: retryFn, variant: 'default' }] : undefined
  )
}

export const showNetworkError = (retryFn?: () => void) => {
  showError(
    'Connection error',
    'Unable to connect to the service. Please check your internet connection.',
    retryFn ? [{ label: 'Retry', action: retryFn, variant: 'default' }] : undefined
  )
}

export const showFeatureUnavailable = (featureName: string, fallbackAction?: () => void) => {
  showWarning(
    `${featureName} unavailable`,
    'This feature is temporarily unavailable. You can continue using other features.',
    fallbackAction ? [{ label: 'Use alternative', action: fallbackAction }] : undefined
  )
}

export const showCollaborationConnected = (peerCount: number) => {
  showSuccess(
    'Collaboration active',
    `Connected to ${peerCount} ${peerCount === 1 ? 'person' : 'people'}. Changes will sync in real-time.`
  )
}

export const showCollaborationDisconnected = () => {
  showWarning(
    'Collaboration disconnected',
    'You are now working offline. Changes will not sync until reconnected.'
  )
}

export const showTranscriptionComplete = (duration: string) => {
  showSuccess(
    'Transcription complete',
    `Audio transcribed successfully in ${duration}. Check for action items below.`
  )
}

export const showVoiceCommandExecuted = (command: string) => {
  showInfo(
    'Voice command executed',
    `"${command}" - Command completed successfully.`,
    undefined
  )
}