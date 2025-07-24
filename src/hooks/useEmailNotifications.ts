import { useState, useEffect, useCallback } from 'react'
import { Task, Meeting } from '@/types'
import { EmailService } from '@/services/email'
import { reminderScheduler, ReminderScheduler } from '@/utils/reminderScheduler'

/**
 * Email notification settings interface
 */
interface EmailNotificationSettings {
  enabled: boolean
  userEmail: string
  remindersEnabled: boolean
  daysBeforeDue: number[]
  overdueReminders: boolean
  overdueIntervalHours: number
  maxOverdueReminders: number
  autoSendMeetingSummary: boolean
  autoSendAgenda: boolean
}

/**
 * Hook for managing email notifications and reminders
 */
export function useEmailNotifications() {
  const [emailService] = useState(() => new EmailService())
  const [settings, setSettings] = useState<EmailNotificationSettings>(() => {
    // Load settings from localStorage
    try {
      const stored = localStorage.getItem('meetingflow:email-settings')
      return stored ? JSON.parse(stored) : {
        enabled: false,
        userEmail: '',
        remindersEnabled: true,
        daysBeforeDue: [1, 3, 7],
        overdueReminders: true,
        overdueIntervalHours: 24,
        maxOverdueReminders: 3,
        autoSendMeetingSummary: false,
        autoSendAgenda: false
      }
    } catch (error) {
      console.error('Error loading email settings:', error)
      return {
        enabled: false,
        userEmail: '',
        remindersEnabled: true,
        daysBeforeDue: [1, 3, 7],
        overdueReminders: true,
        overdueIntervalHours: 24,
        maxOverdueReminders: 3,
        autoSendMeetingSummary: false,
        autoSendAgenda: false
      }
    }
  })
  
  const [isConfigured, setIsConfigured] = useState(false)
  const [lastReminderCheck, setLastReminderCheck] = useState<Date | null>(null)
  
  // Check if email service is configured
  useEffect(() => {
    setIsConfigured(emailService.isConfigured())
  }, [emailService])
  
  // Update reminder scheduler configuration when settings change
  useEffect(() => {
    reminderScheduler.updateConfig({
      enabled: settings.enabled && settings.remindersEnabled,
      daysBeforeDue: settings.daysBeforeDue,
      overdueReminders: settings.overdueReminders,
      overdueIntervalHours: settings.overdueIntervalHours,
      maxOverdueReminders: settings.maxOverdueReminders
    })
  }, [settings])
  
  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('meetingflow:email-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving email settings:', error)
    }
  }, [settings])
  
  /**
   * Update email notification settings
   */
  const updateSettings = useCallback((newSettings: Partial<EmailNotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])
  
  /**
   * Send task reminder manually
   */
  const sendTaskReminder = useCallback(async (task: Task, recipientEmail?: string): Promise<boolean> => {
    if (!isConfigured || !settings.enabled) {
      return false
    }
    
    const email = recipientEmail || task.assignee || settings.userEmail
    if (!email) {
      return false
    }
    
    return await reminderScheduler.sendManualReminder(task, email)
  }, [isConfigured, settings.enabled, settings.userEmail])
  
  /**
   * Send task assignment notification
   */
  const sendTaskAssignment = useCallback(async (task: Task, assigneeEmail: string, assignerName?: string): Promise<boolean> => {
    if (!isConfigured || !settings.enabled) {
      return false
    }
    
    return await emailService.sendTaskAssignment(task, assigneeEmail, assignerName)
  }, [emailService, isConfigured, settings.enabled])
  
  /**
   * Send task completion notification
   */
  const sendTaskCompletion = useCallback(async (task: Task, recipientEmails: string[], completedBy?: string): Promise<boolean> => {
    if (!isConfigured || !settings.enabled) {
      return false
    }
    
    return await emailService.sendTaskCompletion(task, recipientEmails, completedBy)
  }, [emailService, isConfigured, settings.enabled])
  
  /**
   * Send meeting summary
   */
  const sendMeetingSummary = useCallback(async (meeting: Meeting, recipientEmails: string[]): Promise<boolean> => {
    if (!isConfigured || !settings.enabled) {
      return false
    }
    
    return await emailService.sendMeetingSummary(meeting, recipientEmails)
  }, [emailService, isConfigured, settings.enabled])
  
  /**
   * Send meeting agenda
   */
  const sendMeetingAgenda = useCallback(async (meeting: Meeting, recipientEmails: string[]): Promise<boolean> => {
    if (!isConfigured || !settings.enabled) {
      return false
    }
    
    return await emailService.sendAgenda(meeting, recipientEmails)
  }, [emailService, isConfigured, settings.enabled])
  
  /**
   * Check and send automatic reminders for all tasks
   */
  const checkReminders = useCallback(async (tasks: Task[]): Promise<void> => {
    if (!isConfigured || !settings.enabled || !settings.remindersEnabled) {
      return
    }
    
    // Don't check too frequently (minimum 1 hour between checks)
    if (lastReminderCheck) {
      const hoursSinceLastCheck = (Date.now() - lastReminderCheck.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastCheck < 1) {
        return
      }
    }
    
    await reminderScheduler.checkAndSendReminders(tasks, settings.userEmail)
    setLastReminderCheck(new Date())
  }, [isConfigured, settings.enabled, settings.remindersEnabled, settings.userEmail, lastReminderCheck])
  
  /**
   * Get tasks that need reminders
   */
  const getTasksNeedingReminders = useCallback((tasks: Task[]): Task[] => {
    return reminderScheduler.getTasksNeedingReminders(tasks)
  }, [])
  
  /**
   * Clean up reminder tracking data
   */
  const cleanupReminderData = useCallback((existingTaskIds: string[]): void => {
    reminderScheduler.cleanupReminderTracker(existingTaskIds)
  }, [])
  
  /**
   * Test email configuration by sending a test email
   */
  const sendTestEmail = useCallback(async (testEmail: string): Promise<boolean> => {
    if (!isConfigured) {
      return false
    }
    
    return await emailService.sendCustomNotification({
      to_email: testEmail,
      subject: 'MeetingFlow Email Test',
      message: 'This is a test email from MeetingFlow. Your email notifications are working correctly!',
      from_name: 'MeetingFlow'
    })
  }, [emailService, isConfigured])
  
  return {
    // State
    settings,
    isConfigured,
    lastReminderCheck,
    
    // Actions
    updateSettings,
    sendTaskReminder,
    sendTaskAssignment,
    sendTaskCompletion,
    sendMeetingSummary,
    sendMeetingAgenda,
    checkReminders,
    getTasksNeedingReminders,
    cleanupReminderData,
    sendTestEmail
  }
}