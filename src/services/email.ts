import emailjs from 'emailjs-com'
import { getEnvConfig } from '@/lib/env'
import { Task, Meeting } from '@/types'

/**
 * Email template types for different notification scenarios
 */
export type EmailTemplateType = 
  | 'task_reminder'
  | 'task_overdue'
  | 'task_assigned'
  | 'task_completed'
  | 'meeting_summary'
  | 'agenda_shared'

/**
 * Email template parameters for different notification types
 */
interface EmailTemplateParams {
  to_email: string
  to_name?: string
  from_name?: string
  subject?: string
  
  // Task-related parameters
  task_title?: string
  task_description?: string
  task_priority?: string
  task_status?: string
  due_date?: string
  assignee?: string
  
  // Meeting-related parameters
  meeting_title?: string
  meeting_date?: string
  
  // Index signature for additional properties
  [key: string]: string | undefined
  agenda_content?: string
  notes_content?: string
  tasks_summary?: string
  
  // General parameters
  message?: string
  action_url?: string
  reminder_type?: string
}

/**
 * Service for handling EmailJS notifications with comprehensive template support
 */
export class EmailService {
  private userId: string = ''
  private serviceId: string = ''
  private templateId: string = ''
  private isInitialized: boolean = false
  
  constructor() {
    try {
      const { EMAILJS_USER_ID, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } = getEnvConfig()
      this.userId = EMAILJS_USER_ID
      this.serviceId = EMAILJS_SERVICE_ID
      this.templateId = EMAILJS_TEMPLATE_ID
      
      // Initialize EmailJS
      emailjs.init(this.userId)
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error)
      this.isInitialized = false
    }
  }
  
  /**
   * Check if the email service is properly configured
   */
  isConfigured(): boolean {
    return this.isInitialized
  }
  
  /**
   * Send a task reminder email
   */
  async sendTaskReminder(task: Task, recipientEmail: string, reminderType: 'due_soon' | 'overdue' = 'due_soon'): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized')
      return false
    }

    try {
      const templateParams: EmailTemplateParams = {
        to_email: recipientEmail,
        subject: reminderType === 'overdue' 
          ? `Overdue Task: ${task.title}` 
          : `Task Reminder: ${task.title}`,
        task_title: task.title,
        task_description: task.description || 'No description provided',
        due_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
        task_priority: task.priority,
        task_status: task.status,
        assignee: task.assignee || 'Unassigned',
        reminder_type: reminderType,
        message: reminderType === 'overdue'
          ? `Your task "${task.title}" is overdue. Please complete it as soon as possible.`
          : `Your task "${task.title}" is due soon. Don't forget to complete it!`
      }
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      )
      
      return result.status === 200
    } catch (error) {
      console.error('Failed to send task reminder:', error)
      return false
    }
  }
  
  /**
   * Send task assignment notification
   */
  async sendTaskAssignment(task: Task, assigneeEmail: string, assignerName?: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized')
      return false
    }

    try {
      const templateParams: EmailTemplateParams = {
        to_email: assigneeEmail,
        subject: `New Task Assigned: ${task.title}`,
        task_title: task.title,
        task_description: task.description || 'No description provided',
        due_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
        task_priority: task.priority,
        assignee: task.assignee || assigneeEmail,
        from_name: assignerName || 'MeetingFlow',
        message: `You have been assigned a new task: "${task.title}". Please review the details and complete it by the due date.`
      }
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      )
      
      return result.status === 200
    } catch (error) {
      console.error('Failed to send task assignment:', error)
      return false
    }
  }
  
  /**
   * Send task completion notification
   */
  async sendTaskCompletion(task: Task, recipientEmails: string[], completedBy?: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized')
      return false
    }

    try {
      const results = await Promise.all(
        recipientEmails.map(email => {
          const templateParams: EmailTemplateParams = {
            to_email: email,
            subject: `Task Completed: ${task.title}`,
            task_title: task.title,
            task_description: task.description || 'No description provided',
            task_status: 'Completed',
            assignee: completedBy || task.assignee || 'Unknown',
            message: `The task "${task.title}" has been completed by ${completedBy || task.assignee || 'a team member'}.`
          }
          
          return emailjs.send(
            this.serviceId,
            this.templateId,
            templateParams
          )
        })
      )
      
      return results.every(result => result.status === 200)
    } catch (error) {
      console.error('Failed to send task completion notification:', error)
      return false
    }
  }
  
  /**
   * Send meeting summary with agenda and tasks
   */
  async sendMeetingSummary(meeting: Meeting, recipientEmails: string[]): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized')
      return false
    }

    try {
      // Format agenda content
      const agendaContent = meeting.agenda.length > 0
        ? meeting.agenda.map(item => `• ${item.title} (${item.duration} min)`).join('\n')
        : 'No agenda items'
      
      // Format tasks summary
      const tasksSummary = meeting.tasks.length > 0
        ? meeting.tasks.map(task => `• ${task.title} - ${task.status} (${task.priority} priority)`).join('\n')
        : 'No tasks created'
      
      const results = await Promise.all(
        recipientEmails.map(email => {
          const templateParams: EmailTemplateParams = {
            to_email: email,
            subject: `Meeting Summary: ${meeting.title}`,
            meeting_title: meeting.title,
            meeting_date: new Date(meeting.startTime).toLocaleDateString(),
            agenda_content: agendaContent,
            tasks_summary: tasksSummary,
            message: `Here's a summary of the meeting "${meeting.title}" that took place on ${new Date(meeting.startTime).toLocaleDateString()}.`
          }
          
          return emailjs.send(
            this.serviceId,
            this.templateId,
            templateParams
          )
        })
      )
      
      return results.every(result => result.status === 200)
    } catch (error) {
      console.error('Failed to send meeting summary:', error)
      return false
    }
  }
  
  /**
   * Send agenda to participants before meeting
   */
  async sendAgenda(meeting: Meeting, recipientEmails: string[]): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized')
      return false
    }

    try {
      const agendaContent = meeting.agenda.length > 0
        ? meeting.agenda.map(item => `• ${item.title} (${item.duration} min)${item.description ? ` - ${item.description}` : ''}`).join('\n')
        : 'No agenda items set'
      
      const results = await Promise.all(
        recipientEmails.map(email => {
          const templateParams: EmailTemplateParams = {
            to_email: email,
            subject: `Meeting Agenda: ${meeting.title}`,
            meeting_title: meeting.title,
            meeting_date: new Date(meeting.startTime).toLocaleDateString(),
            agenda_content: agendaContent,
            message: `Please find the agenda for the upcoming meeting "${meeting.title}". Come prepared to discuss these topics.`
          }
          
          return emailjs.send(
            this.serviceId,
            this.templateId,
            templateParams
          )
        })
      )
      
      return results.every(result => result.status === 200)
    } catch (error) {
      console.error('Failed to send agenda:', error)
      return false
    }
  }
  
  /**
   * Send custom notification with flexible template parameters
   */
  async sendCustomNotification(templateParams: EmailTemplateParams): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized')
      return false
    }

    try {
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      )
      
      return result.status === 200
    } catch (error) {
      console.error('Failed to send custom notification:', error)
      return false
    }
  }
}