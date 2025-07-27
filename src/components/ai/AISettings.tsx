/**
 * AI Settings Component for managing API keys and privacy settings
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Shield, Bot, Key, AlertTriangle } from 'lucide-react'
import { aiService } from '@/services/aiService'

interface AISettingsProps {
  className?: string
}

export const AISettings: React.FC<AISettingsProps> = ({ className }) => {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoSummary, setAutoSummary] = useState(false)
  const [dataSharing, setDataSharing] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('meetingflow:ai-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setAiEnabled(settings.enabled ?? true)
      setAutoSummary(settings.autoSummary ?? false)
      setDataSharing(settings.dataSharing ?? false)
    }

    const savedApiKey = localStorage.getItem('meetingflow:openrouter-api-key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const saveSettings = () => {
    const settings = {
      enabled: aiEnabled,
      autoSummary,
      dataSharing
    }
    localStorage.setItem('meetingflow:ai-settings', JSON.stringify(settings))
    
    if (apiKey) {
      localStorage.setItem('meetingflow:openrouter-api-key', apiKey)
      aiService.setApiKey(apiKey)
    }
  }

  const testConnection = async () => {
    if (!apiKey) {
      setConnectionStatus('error')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // Test the API key with a simple request
      aiService.setApiKey(apiKey)
      await aiService.sendChatMessage({
        messages: [{
          id: 'test',
          role: 'user',
          content: 'Hello, this is a test message.',
          timestamp: new Date().toISOString()
        }],
        type: 'chat'
      })
      
      setConnectionStatus('success')
    } catch (error) {
      console.error('API key test failed:', error)
      setConnectionStatus('error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const clearApiKey = () => {
    setApiKey('')
    localStorage.removeItem('meetingflow:openrouter-api-key')
    setConnectionStatus('idle')
  }

  const handleSave = () => {
    saveSettings()
    // Show success feedback
    const event = new CustomEvent('show-toast', {
      detail: {
        title: 'Settings Saved',
        description: 'AI assistant settings have been updated.',
        type: 'success'
      }
    })
    window.dispatchEvent(event)
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <CardTitle>MeetingFlow Buddy AI Settings</CardTitle>
          </div>
          <CardDescription>
            Configure your AI assistant preferences and API access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable AI Assistant</Label>
              <p className="text-sm text-muted-foreground">
                Turn on MeetingFlow Buddy to get AI-powered meeting insights
              </p>
            </div>
            <Switch
              checked={aiEnabled}
              onCheckedChange={setAiEnabled}
            />
          </div>

          <Separator />

          {/* API Key Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <Label className="text-base">OpenRouter API Key</Label>
              {connectionStatus === 'success' && (
                <Badge variant="secondary" className="text-green-600">
                  Connected
                </Badge>
              )}
              {connectionStatus === 'error' && (
                <Badge variant="destructive">
                  Connection Failed
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    disabled={!aiEnabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                    disabled={!aiEnabled}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={testConnection}
                  disabled={!apiKey || !aiEnabled || isTestingConnection}
                  variant="outline"
                >
                  {isTestingConnection ? 'Testing...' : 'Test'}
                </Button>
                {apiKey && (
                  <Button
                    onClick={clearApiKey}
                    disabled={!aiEnabled}
                    variant="outline"
                  >
                    Clear
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Get your free API key from{' '}
                <a 
                  href="https://openrouter.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OpenRouter.ai
                </a>
                . The Kimi K2 model is free to use.
              </p>
            </div>
          </div>

          <Separator />

          {/* AI Features */}
          <div className="space-y-4">
            <Label className="text-base">AI Features</Label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Auto-generate meeting summaries</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create summaries when meetings end
                  </p>
                </div>
                <Switch
                  checked={autoSummary}
                  onCheckedChange={setAutoSummary}
                  disabled={!aiEnabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <Label className="text-base">Privacy & Data</Label>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your meeting data is sent to OpenRouter/Kimi K2 for AI processing. 
                No data is stored on external servers beyond the API call.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Allow data processing</Label>
                <p className="text-xs text-muted-foreground">
                  Required for AI features to work. Data is not stored permanently.
                </p>
              </div>
              <Switch
                checked={dataSharing}
                onCheckedChange={setDataSharing}
                disabled={!aiEnabled}
              />
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}