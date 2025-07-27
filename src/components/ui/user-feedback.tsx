/**
 * Comprehensive user feedback system with enhanced notifications
 */

import { useEffect, useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  RefreshCw, 
  Download,
  ExternalLink,
  Clock,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FeedbackAction {
  label: string
  action: () => void | Promise<void>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  icon?: React.ComponentType<{ className?: string }>
  primary?: boolean
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

export interface FeedbackNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: FeedbackAction[]
  progress?: number
  timestamp: string
  context?: string
}

interface UserFeedbackProps {
  notification: FeedbackNotification
  onDismiss: (id: string) => void
  onAction: (action: FeedbackAction) => void
}

export function UserFeedback({ notification, onDismiss, onAction }: UserFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (notification.duration && !notification.persistent) {
      setTimeLeft(notification.duration / 1000)
      
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            handleDismiss()
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [notification.duration, notification.persistent])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(notification.id), 300)
  }

  const handleAction = async (action: FeedbackAction) => {
    if (action.requiresConfirmation) {
      const confirmed = window.confirm(action.confirmationMessage || 'Are you sure?')
      if (!confirmed) return
    }

    try {
      await onAction(action)
      if (!notification.persistent) {
        handleDismiss()
      }
    } catch (error) {
      console.error('Feedback action failed:', error)
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getVariantClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20'
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
      case 'loading':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Card className={cn('w-full max-w-md shadow-lg', getVariantClasses())}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">
                  {notification.title}
                </CardTitle>
                {notification.context && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {notification.context}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {timeLeft && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeLeft}s
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="text-sm mb-3">
            {notification.message}
          </CardDescription>

          {notification.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(notification.progress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${notification.progress}%` }}
                />
              </div>
            </div>
          )}

          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {notification.actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant || (action.primary ? 'default' : 'outline')}
                    onClick={() => handleAction(action)}
                    className="text-xs"
                  >
                    {Icon && <Icon className="h-3 w-3 mr-1" />}
                    {action.label}
                  </Button>
                )
              })}
            </div>
          )}

          <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
            <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
            {notification.type === 'loading' && (
              <div className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Processing...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced feedback manager
export class FeedbackManager {
  private static instance: FeedbackManager
  private notifications: FeedbackNotification[] = []
  private listeners: ((notifications: FeedbackNotification[]) => void)[] = []

  static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager()
    }
    return FeedbackManager.instance
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  subscribe(listener: (notifications: FeedbackNotification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  show(notification: Omit<FeedbackNotification, 'id' | 'timestamp'>): string {
    const id = Math.random().toString(36).substring(2, 9)
    const fullNotification: FeedbackNotification = {
      ...notification,
      id,
      timestamp: new Date().toISOString()
    }

    this.notifications.push(fullNotification)
    this.notify()

    // Auto-dismiss if not persistent and has duration
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        this.dismiss(id)
      }, notification.duration)
    }

    return id
  }

  dismiss(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notify()
  }

  dismissAll() {
    this.notifications = []
    this.notify()
  }

  update(id: string, updates: Partial<FeedbackNotification>) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates }
      this.notify()
    }
  }

  // Convenience methods
  success(title: string, message: string, actions?: FeedbackAction[]) {
    return this.show({
      type: 'success',
      title,
      message,
      duration: 5000,
      actions
    })
  }

  error(title: string, message: string, actions?: FeedbackAction[]) {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 8000,
      persistent: true,
      actions
    })
  }

  warning(title: string, message: string, actions?: FeedbackAction[]) {
    return this.show({
      type: 'warning',
      title,
      message,
      duration: 6000,
      actions
    })
  }

  info(title: string, message: string, actions?: FeedbackAction[]) {
    return this.show({
      type: 'info',
      title,
      message,
      duration: 5000,
      actions
    })
  }

  loading(title: string, message: string, progress?: number) {
    return this.show({
      type: 'loading',
      title,
      message,
      persistent: true,
      progress
    })
  }
}

export const feedbackManager = FeedbackManager.getInstance()

// React hook for using feedback manager
export function useFeedback() {
  const [notifications, setNotifications] = useState<FeedbackNotification[]>([])

  useEffect(() => {
    return feedbackManager.subscribe(setNotifications)
  }, [])

  return {
    notifications,
    show: feedbackManager.show.bind(feedbackManager),
    dismiss: feedbackManager.dismiss.bind(feedbackManager),
    dismissAll: feedbackManager.dismissAll.bind(feedbackManager),
    update: feedbackManager.update.bind(feedbackManager),
    success: feedbackManager.success.bind(feedbackManager),
    error: feedbackManager.error.bind(feedbackManager),
    warning: feedbackManager.warning.bind(feedbackManager),
    info: feedbackManager.info.bind(feedbackManager),
    loading: feedbackManager.loading.bind(feedbackManager)
  }
}

// Feedback container component
export function FeedbackContainer() {
  const { notifications, dismiss } = useFeedback()

  const handleAction = async (action: FeedbackAction) => {
    await action.action()
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notification => (
        <UserFeedback
          key={notification.id}
          notification={notification}
          onDismiss={dismiss}
          onAction={handleAction}
        />
      ))}
    </div>
  )
}