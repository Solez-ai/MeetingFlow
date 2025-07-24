import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2, VolumeX, HelpCircle } from 'lucide-react'
import { useVoiceCommandContext } from './VoiceCommandProvider'
import { useAppStore } from '@/store'
import { VoiceCommandHelp } from './VoiceCommandHelp'
import { VoiceCommandFeedback } from './VoiceCommandFeedback'

export function VoiceCommands() {
  const [showHelp, setShowHelp] = useState(false)
  const [commandFeedback, setCommandFeedback] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const { settings, updateSettings } = useAppStore()
  const {
    isListening,
    isSupported,
    lastCommand,
    lastResult,
    toggleListening
  } = useVoiceCommandContext()

  // Update feedback based on last result
  useEffect(() => {
    if (lastResult) {
      if (lastResult.success) {
        setCommandFeedback({
          message: `Command executed: "${lastCommand}"`,
          type: 'success'
        })
      } else {
        setCommandFeedback({
          message: `Command failed: ${lastResult.error}`,
          type: 'error'
        })
      }
      
      // Clear feedback after 3 seconds
      setTimeout(() => setCommandFeedback(null), 3000)
    } else if (lastCommand && !lastResult) {
      setCommandFeedback({
        message: `Command not recognized: "${lastCommand}"`,
        type: 'info'
      })
      
      setTimeout(() => setCommandFeedback(null), 3000)
    }
  }, [lastCommand, lastResult])

  const handleToggleVoiceCommands = () => {
    const newEnabled = !settings.voiceCommandsEnabled
    updateSettings({ voiceCommandsEnabled: newEnabled })
    
    if (!newEnabled && isListening) {
      // Stop listening if voice commands are disabled
      toggleListening()
    }
  }

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            <VolumeX className="h-5 w-5 mr-2" />
            <span>Voice commands are not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Commands
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Badge variant={settings.voiceCommandsEnabled ? "default" : "secondary"}>
                {settings.voiceCommandsEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable Voice Commands</span>
            <Button
              variant={settings.voiceCommandsEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleToggleVoiceCommands}
            >
              {settings.voiceCommandsEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {settings.voiceCommandsEnabled && (
            <>
              {/* Microphone Toggle */}
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  onClick={toggleListening}
                  className="gap-2"
                  disabled={!settings.voiceCommandsEnabled}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Start Listening
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  {isListening 
                    ? "Listening for voice commands..." 
                    : "Click to start listening for voice commands"}
                </p>
              </div>

              {/* Status Display */}
              {lastCommand && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Last Command:</p>
                  <p className="text-sm text-muted-foreground">"{lastCommand}"</p>
                  {lastResult && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {lastResult.success ? 'Success' : 'Failed'}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Command Feedback */}
      {commandFeedback && (
        <VoiceCommandFeedback
          message={commandFeedback.message}
          type={commandFeedback.type}
        />
      )}

      {/* Help Panel */}
      {showHelp && <VoiceCommandHelp />}
    </div>
  )
}