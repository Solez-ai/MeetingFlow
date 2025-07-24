import { Task } from '@/types'
import { EmailService } from '@/services/email'

/**
 * Reminder configuration interface
 */
interface ReminderConfig {
  enabled: boolean
  daysBeforeDue: number[]  // Days before due date to send reminders (e.g., [1, 3, 7])
  overdueReminders: boolean
  overdueIntervalHours: number  // Hours between overdue reminders
  maxOverdueReminders: number   // Maximum number of overdue reminders to send
}

/**
 * Reminder tracking interface for localStorage
 */
interface ReminderTracker {
  taskId: string
  lastReminderSent: string  // ISO date string
  remindersSent: number
  overdueRemindersSent: number
}

/**
 * Service for scheduling and managing task reminders
 */
export class ReminderScheduler {
  private emailService: EmailService
  private config: ReminderConfig
  private storageKey = 'meetingflow:reminder-tracker'
  
  constructor(config?: Partial<ReminderConfig>) {
    this.emailService = new EmailService()
    this.config = {
      enabled: true,
      daysBeforeDue: [1, 3, 7],
      overdueReminders: true,
      overdueIntervalHours: 24,
      maxOverdueReminders: 3,
      ...config
    }
  }
  
  /**
   * Check all tasks and send reminders as needed
   */
  async checkAndSendReminders(tasks: Task[], userEmail?: string): Promise<void> {
    if (!this.config.enabled || !this.emailService.isConfigured()) {
      return
    }
    
    const now = new Date()
    const reminderTracker = this.getReminderTracker()
    
    for (const task of tasks) {
      // Skip completed tasks
      if (task.status === 'Done') {
        continue
      }
      
      // Skip tasks without due dates
      if (!task.dueDate) {
        continue
      }
      
      const dueDate = new Date(task.dueDate)
      const recipientEmail = task.assignee || userEmail
      
      if (!recipientEmail) {
        continue
      }
      
      const tracker = reminderTracker.find(t => t.taskId === task.id) || {
        taskId: task.id,
        lastReminderSent: '',
        remindersSent: 0,
        overdueRemindersSent: 0
      }
      
      // Check if task is overdue
      if (dueDate < now) {
        await this.handleOverdueTask(task, recipientEmail, tracker)
      } else {
        await this.handleUpcomingTask(task, recipientEmail, tracker, dueDate, now)
      }
      
      // Update tracker
      this.updateReminderTracker(tracker)
    }
  }
  
  /**
   * Handle reminders for overdue tasks
   */
  private async handleOverdueTask(
    task: Task, 
    recipientEmail: string, 
    tracker: ReminderTracker
  ): Promise<void> {
    if (!this.config.overdueReminders) {
      return
    }
    
    // Check if we've reached the maximum number of overdue reminders
    if (tracker.overdueRemindersSent >= this.config.maxOverdueReminders) {
      return
    }
    
    // Check if enough time has passed since the last overdue reminder
    const lastReminder = tracker.lastReminderSent ? new Date(tracker.lastReminderSent) : null
    const now = new Date()
    
    if (lastReminder) {
      const hoursSinceLastReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastReminder < this.config.overdueIntervalHours) {
        return
      }
    }
    
    // Send overdue reminder
    const success = await this.emailService.sendTaskReminder(task, recipientEmail, 'overdue')
    
    if (success) {
      tracker.lastReminderSent = now.toISOString()
      tracker.overdueRemindersSent += 1
      
      console.log(`Sent overdue reminder for task: ${task.title}`)
    }
  }
  
  /**
   * Handle reminders for upcoming tasks
   */
  private async handleUpcomingTask(
    task: Task,
    recipientEmail: string,
    tracker: ReminderTracker,
    dueDate: Date,
    now: Date
  ): Promise<void> {
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Check if we should send a reminder based on the configured days
    const shouldSendReminder = this.config.daysBeforeDue.includes(daysUntilDue)
    
    if (!shouldSendReminder) {
      return
    }
    
    // Check if we've already sent a reminder for this day
    const lastReminder = tracker.lastReminderSent ? new Date(tracker.lastReminderSent) : null
    
    if (lastReminder) {
      const daysSinceLastReminder = Math.floor((now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastReminder < 1) {
        return // Already sent a reminder today
      }
    }
    
    // Send upcoming task reminder
    const success = await this.emailService.sendTaskReminder(task, recipientEmail, 'due_soon')
    
    if (success) {
      tracker.lastReminderSent = now.toISOString()
      tracker.remindersSent += 1
      
      console.log(`Sent reminder for task: ${task.title} (due in ${daysUntilDue} days)`)
    }
  }
  
  /**
   * Get reminder tracker data from localStorage
   */
  private getReminderTracker(): ReminderTracker[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading reminder tracker:', error)
      return []
    }
  }
  
  /**
   * Update reminder tracker in localStorage
   */
  private updateReminderTracker(tracker: ReminderTracker): void {
    try {
      const allTrackers = this.getReminderTracker()
      const existingIndex = allTrackers.findIndex(t => t.taskId === tracker.taskId)
      
      if (existingIndex >= 0) {
        allTrackers[existingIndex] = tracker
      } else {
        allTrackers.push(tracker)
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(allTrackers))
    } catch (error) {
      console.error('Error saving reminder tracker:', error)
    }
  }
  
  /**
   * Clean up old reminder tracking data for deleted tasks
   */
  cleanupReminderTracker(existingTaskIds: string[]): void {
    try {
      const allTrackers = this.getReminderTracker()
      const cleanedTrackers = allTrackers.filter(tracker => 
        existingTaskIds.includes(tracker.taskId)
      )
      
      localStorage.setItem(this.storageKey, JSON.stringify(cleanedTrackers))
    } catch (error) {
      console.error('Error cleaning up reminder tracker:', error)
    }
  }
  
  /**
   * Update reminder configuration
   */
  updateConfig(newConfig: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
  
  /**
   * Get current reminder configuration
   */
  getConfig(): ReminderConfig {
    return { ...this.config }
  }
  
  /**
   * Manually send a reminder for a specific task
   */
  async sendManualReminder(task: Task, recipientEmail: string): Promise<boolean> {
    if (!this.emailService.isConfigured()) {
      return false
    }
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
    const reminderType = isOverdue ? 'overdue' : 'due_soon'
    
    return await this.emailService.sendTaskReminder(task, recipientEmail, reminderType)
  }
  
  /**
   * Get tasks that need reminders (for UI display)
   */
  getTasksNeedingReminders(tasks: Task[]): Task[] {
    const now = new Date()
    
    return tasks.filter(task => {
      if (task.status === 'Done' || !task.dueDate) {
        return false
      }
      
      const dueDate = new Date(task.dueDate)
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      // Include overdue tasks and tasks due within configured reminder days
      return daysUntilDue <= 0 || this.config.daysBeforeDue.includes(daysUntilDue)
    })
  }
}

/**
 * Create a singleton instance for the app
 */
export const reminderScheduler = new ReminderScheduler()