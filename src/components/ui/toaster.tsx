import { useEffect, useState } from "react"
import { Button } from "./button"

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
  actions?: Array<{
    label: string
    action: () => void | Promise<void>
    primary?: boolean
  }>
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    // Listen for toast events
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent
      const { 
        title, 
        description, 
        variant = "default", 
        duration = 5000,
        actions 
      } = customEvent.detail || {}
      
      const id = Math.random().toString(36).substring(2, 9)
      
      const toastData: ToastData = {
        id,
        title,
        description,
        variant,
        duration,
        actions
      }
      
      setToasts(prev => [...prev, toastData])
      
      // Auto-dismiss after duration (unless it has actions)
      if (!actions || actions.length === 0) {
        setTimeout(() => {
          dismissToast(id)
        }, duration)
      }
    }
    
    window.addEventListener('toast', handleToast)
    
    return () => {
      window.removeEventListener('toast', handleToast)
    }
  }, [])

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant}>
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex gap-2 mt-2">
                {toast.actions.map((action, index) => (
                  <ToastAction
                    key={index}
                    onClick={async () => {
                      try {
                        await action.action()
                        dismissToast(toast.id)
                      } catch (error) {
                        console.error('Toast action failed:', error)
                      }
                    }}
                    className={action.primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                  >
                    {action.label}
                  </ToastAction>
                ))}
              </div>
            )}
          </div>
          <ToastClose onClick={() => dismissToast(toast.id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}