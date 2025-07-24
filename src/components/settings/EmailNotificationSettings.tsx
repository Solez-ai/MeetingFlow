import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Mail, Send, Settings, TestTube, CheckCircle, AlertCircle } from 'lucide-react'
import { useEmailNotifications } from '@/hooks/useEmailNotifications'
import { cn } from '@/lib/utils'

export function EmailNotificationSettings() {
  const {
    settings,
    isConfigured,
    updateSettings,
    sendTestEmail
  } = useEmailNotifications()
  
  const [testEmail, setTestEmail] = useState(settings.userEmail)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [customDays, setCustomDays] = useState('')
  
  // Handle test email
  const handleTestEmail = async () => {
    if (!testEmail) return
    
    setIsTestingEmail(true)
    setTestResult(null)
    
    try {
      const success = await sendTestEmail(testEmail)
      setTestResult(success ? 'success' : 'error')
      
      // Show toast notification
      const event = new CustomEvent('toast', {
        detail: {
          title: success ? 'Test email sent' : 'Test email failed',
          description: success 
            ? 'Check your inbox for the test email.' 
            : 'Failed to send test email. Please check your configuration.',
          variant: success ? 'success' : 'destructive'
        }
      })
      window.dispatchEvent(event)
    } catch (error) {
      setTestResult('error')
    } finally {
      setIsTestingEmail(false)
    }
  }
  
  // Handle adding custom reminder days
  const handleAddCustomDays = () => {
    if (!customDays) return
    
    const days = customDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d > 0)
    if (days.length > 0) {
      const newDays = [...new Set([...settings.daysBeforeDue, ...days])].sort((a, b) => a - b)
      updateSettings({ daysBeforeDue: newDays })
      setCustomDays('')
    }
  }
  
  // Handle removing reminder day
  const handleRemoveDay = (day: number) => {
    const newDays = settings.daysBeforeDue.filter(d => d !== day)
    updateSettings({ daysBeforeDue: newDays })
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
          <CardDescription>
            Configure email notifications for task reminders and meeting updates.
            {!isConfigured && ' EmailJS configuration is required in environment variables.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on email notifications for tasks and meetings
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
              disabled={!isConfigured}
            />
          </div>
          
          <Separator />
          
          {/* User email */}
          <div className="space-y-2">
            <Label htmlFor="user-email">Your Email Address</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="your.email@example.com"
              value={settings.userEmail}
              onChange={(e) => updateSettings({ userEmail: e.target.value })}
              disabled={!isConfigured}
            />
            <p className="text-sm text-muted-foreground">
              This email will be used as the default recipient for notifications
            </p>
          </div>
          
          {/* Test email */}
          {isConfigured && settings.userEmail && (
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email Configuration</Label>
              <div className="flex gap-2">
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button
                  onClick={handleTestEmail}
                  disabled={!testEmail || isTestingEmail}
                  size="sm"
                  className="gap-2"
                >
                  {isTestingEmail ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4" />
                      Test
                    </>
                  )}
                </Button>
              </div>
              {testResult && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  testResult === 'success' ? "text-green-600" : "text-red-600"
                )}>
                  {testResult === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {testResult === 'success' 
                    ? 'Test email sent successfully!' 
                    : 'Failed to send test email. Check your configuration.'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Task Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Task Reminders
          </CardTitle>
          <CardDescription>
            Configure automatic reminders for task due dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic reminders before tasks are due
              </p>
            </div>
            <Switch
              checked={settings.remindersEnabled}
              onCheckedChange={(remindersEnabled) => updateSettings({ remindersEnabled })}
              disabled={!isConfigured || !settings.enabled}
            />
          </div>
          
          {/* Reminder days */}
          <div className="space-y-3">
            <Label>Reminder Schedule</Label>
            <p className="text-sm text-muted-foreground">
              Send reminders this many days before tasks are due
            </p>
            
            <div className="flex flex-wrap gap-2">
              {settings.daysBeforeDue.map(day => (
                <Badge
                  key={day}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveDay(day)}
                >
                  {day} day{day !== 1 ? 's' : ''}
                  <span className="text-xs">×</span>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add days (e.g., 1, 3, 7)"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                disabled={!isConfigured || !settings.enabled || !settings.remindersEnabled}
              />
              <Button
                onClick={handleAddCustomDays}
                disabled={!customDays || !isConfigured || !settings.enabled || !settings.remindersEnabled}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Overdue reminders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Overdue Task Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send reminders for tasks that are past their due date
                </p>
              </div>
              <Switch
                checked={settings.overdueReminders}
                onCheckedChange={(overdueReminders) => updateSettings({ overdueReminders })}
                disabled={!isConfigured || !settings.enabled || !settings.remindersEnabled}
              />
            </div>
            
            {settings.overdueReminders && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overdue-interval">Reminder Interval (hours)</Label>
                  <Input
                    id="overdue-interval"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.overdueIntervalHours}
                    onChange={(e) => updateSettings({ overdueIntervalHours: parseInt(e.target.value) || 24 })}
                    disabled={!isConfigured || !settings.enabled || !settings.remindersEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-reminders">Max Reminders</Label>
                  <Input
                    id="max-reminders"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxOverdueReminders}
                    onChange={(e) => updateSettings({ maxOverdueReminders: parseInt(e.target.value) || 3 })}
                    disabled={!isConfigured || !settings.enabled || !settings.remindersEnabled}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Meeting Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Meeting Notifications
          </CardTitle>
          <CardDescription>
            Configure automatic notifications for meetings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-send Meeting Summary</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send meeting summary after meetings end
              </p>
            </div>
            <Switch
              checked={settings.autoSendMeetingSummary}
              onCheckedChange={(autoSendMeetingSummary) => updateSettings({ autoSendMeetingSummary })}
              disabled={!isConfigured || !settings.enabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-send Meeting Agenda</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send agenda to participants when created
              </p>
            </div>
            <Switch
              checked={settings.autoSendAgenda}
              onCheckedChange={(autoSendAgenda) => updateSettings({ autoSendAgenda })}
              disabled={!isConfigured || !settings.enabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}