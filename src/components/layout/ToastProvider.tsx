import { createContext, useContext, useState, ReactNode } from 'react'
import { Toast, ToastTitle, ToastDescription } from '../ui/toast'
import { v4 as uuidv4 } from 'uuid'

interface ToastProps {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => string
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = uuidv4()
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
    
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            variant={toast.variant}
          >
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            <ToastDescription>{toast.description}</ToastDescription>
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return context
}