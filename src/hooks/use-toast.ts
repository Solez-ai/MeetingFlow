/**
 * Toast hook for notifications
 */

import { useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

let toastState: ToastState = { toasts: [] }
let listeners: Array<(state: ToastState) => void> = []

const notify = (state: ToastState) => {
  listeners.forEach(listener => listener(state))
}

export const useToast = () => {
  const [state, setState] = useState(toastState)

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, title, description, variant, duration }
    
    toastState = {
      toasts: [...toastState.toasts, newToast]
    }
    
    notify(toastState)

    // Auto remove after duration
    setTimeout(() => {
      toastState = {
        toasts: toastState.toasts.filter(t => t.id !== id)
      }
      notify(toastState)
    }, duration)
  }, [])

  const dismiss = useCallback((id: string) => {
    toastState = {
      toasts: toastState.toasts.filter(t => t.id !== id)
    }
    notify(toastState)
  }, [])

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = subscribe(setState)
    return unsubscribe
  }, [subscribe])

  return {
    toast,
    dismiss,
    toasts: state.toasts
  }
}