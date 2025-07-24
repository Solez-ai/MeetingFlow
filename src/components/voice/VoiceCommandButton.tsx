import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Mic, MicOff } from 'lucide-react'
import { useVoiceCommandContext } from './VoiceCommandProvider'
import { useAppStore } from '@/store'
import { VoiceCommands } from './VoiceCommands'
import { cn } from '@/lib/utils'

interface VoiceCommandButtonProps {
  className?: string
  variant?: 'floating' | 'inline'
}

export function VoiceCommandButton({ className, variant = 'floating' }: VoiceCommandButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { settings } = useAppStore()
  const {
    isListening,
    isSupported,
    toggleListening
  } = useVoiceCommandContext()

  if (!isSupported) {
    return null
  }

  const buttonContent = (
    <Button
      variant={isListening ? "destructive" : "default"}
      size={variant === 'floating' ? "lg" : "default"}
      className={cn(
        variant === 'floating' && [
          "fixed bottom-6 right-6 z-50 rounded-full shadow-lg",
          "h-14 w-14 p-0",
          isListening && "animate-pulse"
        ],
        className
      )}
      onClick={variant === 'floating' ? toggleListening : () => setIsDialogOpen(true)}
      disabled={!settings.voiceCommandsEnabled}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  )

  if (variant === 'floating') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>
              {!settings.voiceCommandsEnabled 
                ? "Voice commands disabled" 
                : isListening 
                  ? "Stop listening" 
                  : "Start voice commands"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {buttonContent}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Voice Commands</DialogTitle>
        </DialogHeader>
        <VoiceCommands />
      </DialogContent>
    </Dialog>
  )
}