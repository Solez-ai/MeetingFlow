import { useEffect, useState } from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const [toasts, setToasts] = useState<{
    id: string
    title?: string
    description?: string
    variant?: "default" | "destructive" | "success"
  }[]>([])

  useEffect(() => {
    // Listen for toast events
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent
      const { title, description, variant } = customEvent.detail || {}
      
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts(prev => [...prev, { id, title, description, variant }])
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 5000)
    }
    
    window.addEventListener('toast', handleToast)
    
    return () => {
      window.removeEventListener('toast', handleToast)
    }
  }, [])

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
          <ToastClose onClick={() => setToasts(prev => prev.filter(toast => toast.id !== id))} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}