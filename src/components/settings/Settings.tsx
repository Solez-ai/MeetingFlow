import { useTheme } from '../layout/ThemeProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { VoiceCommands } from '../voice/VoiceCommands'
import { VoiceCommandTest } from '../voice/VoiceCommandTest'
import { useAppStore } from '@/store'
import { useState } from 'react'

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { settings } = useAppStore()
  const [showVoiceTest, setShowVoiceTest] = useState(false)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your MeetingFlow preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how MeetingFlow looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Commands Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Voice Commands
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceTest(!showVoiceTest)}
              >
                {showVoiceTest ? 'Hide' : 'Show'} Test Panel
              </Button>
            </CardTitle>
            <CardDescription>
              Configure voice command recognition and control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceCommands />
            {showVoiceTest && (
              <div className="mt-6 pt-6 border-t">
                <VoiceCommandTest />
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Manage your external service integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              API configuration will be implemented in future tasks
            </p>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Data</CardTitle>
            <CardDescription>
              Control how your data is stored and used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Privacy settings will be implemented in future tasks
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}