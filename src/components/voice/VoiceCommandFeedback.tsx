import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceCommandFeedbackProps {
  message: string
  type: 'success' | 'error' | 'info'
}

export function VoiceCommandFeedback({ message, type }: VoiceCommandFeedbackProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info
  }

  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  }

  const Icon = icons[type]

  return (
    <Card className={cn('w-full animate-in slide-in-from-top-2 duration-300', colors[type])}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}