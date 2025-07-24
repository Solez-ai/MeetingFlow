import { useVoiceCommandContext } from './VoiceCommandProvider'
import { useAppStore } from '@/store'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceCommandIndicatorProps {
  className?: string
  showText?: boolean
}

export function VoiceCommandIndicator({ className, showText = false }: VoiceCommandIndicatorProps) {
  const { isListening, isSupported } = useVoiceCommandContext()
  const { settings } = useAppStore()

  if (!isSupported || !settings.voiceCommandsEnabled) {
    return null
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      isListening && "text-red-600 dark:text-red-400",
      !isListening && "text-muted-foreground",
      className
    )}>
      {isListening ? (
        <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
      ) : (
        <MicOff className="h-4 w-4" />
      )}
      
      {showText && (
        <span className="text-xs">
          {isListening ? "Listening..." : "Voice commands ready"}
        </span>
      )}
    </div>
  )
}