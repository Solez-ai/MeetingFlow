import emailjs from 'emailjs-com'
import { getEnvConfig } from '@/lib/env'
import { Task } from '@/types'

/**
 * Service for handling EmailJS notifications
 */
export class EmailService {
  private userId: string
  private serviceId: string
  private templateId: string
  
  constructor() {
    const { EMAILJS_USER_ID, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } = getEnvConfig()
    this.userId = EMAILJS_USER_ID
    this.serviceId = EMAILJS_SERVICE_ID
    this.templateId = EMAILJS_TEMPLATE_ID
    
    // Initialize EmailJS
    emailjs.init(this.userId)
  }
  
  /**
   * Send a task reminder email
   */
  async sendTaskReminder(task: Task, recipientEmail: string): Promise<boolean> {
    try {
      const templateParams = {
        to_email: recipientEmail,
        task_title: task.title,
        task_description: task.description || 'No description provided',
        due_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
        priority: task.priority,
      }
      
      await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      )
      
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }
  
  /**
   * Send meeting notes to participants
   */
  async sendMeetingNotes(
    meetingTitle: string,
    notes: string,
    recipients: string[]
  ): Promise<boolean> {
    try {
      // Send to each recipient
      const results = await Promise.all(
        recipients.map(email => {
          const templateParams = {
            to_email: email,
            meeting_title: meetingTitle,
            notes_content: notes,
            date: new Date().toLocaleDateString(),
          }
          
          return emailjs.send(
            this.serviceId,
            this.templateId,
            templateParams
          )
        })
      )
      
      // Check if all emails were sent successfully
      return results.every(result => result.status === 200)
    } catch (error) {
      console.error('Failed to send meeting notes:', error)
      return false
    }
  }
}