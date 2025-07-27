import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmailService } from '../email'
import { mockTasks, mockMeeting } from '../../test/fixtures'

// Mock emailjs-com
const mockEmailJS = {
  init: vi.fn(),
  send: vi.fn()
}
vi.mock('emailjs-com', () => ({
  default: mockEmailJS
}))

// Mock environment config
vi.mock('@/lib/env', () => ({
  getEnvConfig: vi.fn(() => ({
    EMAILJS_USER_ID: 'test-user-id',
    EMAILJS_SERVICE_ID: 'test-service-id',
    EMAILJS_TEMPLATE_ID: 'test-template-id'
  }))
}))

describe('EmailService', () => {
  let emailService: EmailService
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockEmailJS.send.mockResolvedValue({ status: 200 })
    emailService = new EmailService()
  })

  describe('Initialization', () => {
    it('should initialize EmailJS with correct user ID', () => {
      expect(mockEmailJS.init).toHaveBeenCalledWith('test-user-id')
    })

    it('should be configured when environment variables are available', () => {
      expect(emailService.isConfigured()).toBe(true)
    })

    it('should handle initialization errors gracefully', () => {
      vi.mocked(require('@/lib/env')).getEnvConfig.mockImplementation(() => {
        throw new Error('Environment config error')
      })
      
      const failedService = new EmailService()
      expect(failedService.isConfigured()).toBe(false)
    })
  })

  describe('Task Reminder Emails', () => {
    it('should send task reminder email successfully', async () => {
      const task = mockTasks[0]
      const recipientEmail = 'test@example.com'
      
      const result = await emailService.sendTaskReminder(task, recipientEmail)
      
      expect(result).toBe(true)
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          to_email: recipientEmail,
          task_title: task.title,
          task_description: task.description,
          due_date: new Date(task.dueDate!).toLocaleDateString(),
          task_priority: task.priority,
          task_status: task.status,
          reminder_type: 'due_soon'
        })
      )
    })

    it('should send overdue task reminder with correct parameters', async () => {
      const task = mockTasks[0]
      const recipientEmail = 'test@example.com'
      
      await emailService.sendTaskReminder(task, recipientEmail, 'overdue')
      
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          reminder_type: 'overdue',
          subject: `Overdue Task: ${task.title}`,
          message: expect.stringContaining('overdue')
        })
      )
    })

    it('should handle task without due date', async () => {
      const taskWithoutDueDate = { ...mockTasks[0], dueDate: undefined }
      const recipientEmail = 'test@example.com'
      
      await emailService.sendTaskReminder(taskWithoutDueDate, recipientEmail)
      
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          due_date: 'No due date'
        })
      )
    })

    it('should handle task without description', async () => {
      const taskWithoutDescription = { ...mockTasks[0], description: undefined }
      const recipientEmail = 'test@example.com'
      
      await emailService.sendTaskReminder(taskWithoutDescription, recipientEmail)
      
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          task_description: 'No description provided'
        })
      )
    })

    it('should return false when EmailJS is not initialized', async () => {
      const uninitializedService = new EmailService()
      uninitializedService['isInitialized'] = false
      
      const result = await uninitializedService.sendTaskReminder(mockTasks[0], 'test@example.com')
      
      expect(result).toBe(false)
      expect(mockEmailJS.send).not.toHaveBeenCalled()
    })

    it('should handle EmailJS send errors', async () => {
      mockEmailJS.send.mockRejectedValue(new Error('Send failed'))
      
      const result = await emailService.sendTaskReminder(mockTasks[0], 'test@example.com')
      
      expect(result).toBe(false)
    })
  })

  describe('Task Assignment Emails', () => {
    it('should send task assignment email successfully', async () => {
      const task = mockTasks[0]
      const assigneeEmail = 'assignee@example.com'
      const assignerName = 'John Doe'
      
      const result = await emailService.sendTaskAssignment(task, assigneeEmail, assignerName)
      
      expect(result).toBe(true)
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          to_email: assigneeEmail,
          subject: `New Task Assigned: ${task.title}`,
          task_title: task.title,
          from_name: assignerName,
          message: expect.stringContaining('assigned a new task')
        })
      )
    })

    it('should use default assigner name when not provided', async () => {
      const task = mockTasks[0]
      const assigneeEmail = 'assignee@example.com'
      
      await emailService.sendTaskAssignment(task, assigneeEmail)
      
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          from_name: 'MeetingFlow'
        })
      )
    })
  })

  describe('Task Completion Emails', () => {
    it('should send task completion email to multiple recipients', async () => {
      const task = mockTasks[0]
      const recipients = ['user1@example.com', 'user2@example.com']
      const completedBy = 'Jane Doe'
      
      const result = await emailService.sendTaskCompletion(task, recipients, completedBy)
      
      expect(result).toBe(true)
      expect(mockEmailJS.send).toHaveBeenCalledTimes(2)
      
      recipients.forEach(email => {
        expect(mockEmailJS.send).toHaveBeenCalledWith(
          'test-service-id',
          'test-template-id',
          expect.objectContaining({
            to_email: email,
            subject: `Task Completed: ${task.title}`,
            task_status: 'Completed',
            assignee: completedBy
          })
        )
      })
    })

    it('should handle partial failures in multiple recipient emails', async () => {
      mockEmailJS.send
        .mockResolvedValueOnce({ status: 200 })
        .mockResolvedValueOnce({ status: 400 })
      
      const result = await emailService.sendTaskCompletion(
        mockTasks[0],
        ['user1@example.com', 'user2@example.com']
      )
      
      expect(result).toBe(false)
    })
  })

  describe('Meeting Summary Emails', () => {
    it('should send meeting summary with agenda and tasks', async () => {
      const recipients = ['user1@example.com', 'user2@example.com']
      
      const result = await emailService.sendMeetingSummary(mockMeeting, recipients)
      
      expect(result).toBe(true)
      expect(mockEmailJS.send).toHaveBeenCalledTimes(2)
      
      recipients.forEach(email => {
        expect(mockEmailJS.send).toHaveBeenCalledWith(
          'test-service-id',
          'test-template-id',
          expect.objectContaining({
            to_email: email,
            subject: `Meeting Summary: ${mockMeeting.title}`,
            meeting_title: mockMeeting.title,
            meeting_date: new Date(mockMeeting.startTime).toLocaleDateString(),
            agenda_content: expect.stringContaining('Project Overview'),
            tasks_summary: expect.stringContaining('Review project requirements')
          })
        )
      })
    })

    it('should handle meeting without agenda items', async () => {
      const meetingWithoutAgenda = { ...mockMeeting, agenda: [] }
      
      await emailService.sendMeetingSummary(meetingWithoutAgenda, ['test@example.com'])
      
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          agenda_content: 'No agenda items'
        })
      )
    })

    it('should handle meeting without tasks', async () => {
      const meetingWithoutTasks = { ...mockMeeting, tasks: [] }
      
      await emailService.sendMeetingSummary(meetingWithoutTasks, ['test@example.com'])
      
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          tasks_summary: 'No tasks created'
        })
      )
    })
  })

  describe('Agenda Emails', () => {
    it('should send agenda to participants', async () => {
      const recipients = ['user1@example.com', 'user2@example.com']
      
      const result = await emailService.sendAgenda(mockMeeting, recipients)
      
      expect(result).toBe(true)
      expect(mockEmailJS.send).toHaveBeenCalledTimes(2)
      
      recipients.forEach(email => {
        expect(mockEmailJS.send).toHaveBeenCalledWith(
          'test-service-id',
          'test-template-id',
          expect.objectContaining({
            to_email: email,
            subject: `Meeting Agenda: ${mockMeeting.title}`,
            agenda_content: expect.stringContaining('Project Overview (15 min)')
          })
        )
      })
    })

    it('should include agenda item descriptions when available', async () => {
      await emailService.sendAgenda(mockMeeting, ['test@example.com'])
      
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        expect.objectContaining({
          agenda_content: expect.stringContaining('Discuss project goals and timeline')
        })
      )
    })
  })

  describe('Custom Notifications', () => {
    it('should send custom notification with provided parameters', async () => {
      const customParams = {
        to_email: 'custom@example.com',
        subject: 'Custom Subject',
        message: 'Custom message content',
        custom_field: 'custom value'
      }
      
      const result = await emailService.sendCustomNotification(customParams)
      
      expect(result).toBe(true)
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        'test-service-id',
        'test-template-id',
        customParams
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle EmailJS API errors gracefully', async () => {
      mockEmailJS.send.mockRejectedValue(new Error('API Error'))
      
      const result = await emailService.sendTaskReminder(mockTasks[0], 'test@example.com')
      
      expect(result).toBe(false)
    })

    it('should handle non-200 status responses', async () => {
      mockEmailJS.send.mockResolvedValue({ status: 400 })
      
      const result = await emailService.sendTaskReminder(mockTasks[0], 'test@example.com')
      
      expect(result).toBe(false)
    })

    it('should return false for all methods when not initialized', async () => {
      const uninitializedService = new EmailService()
      uninitializedService['isInitialized'] = false
      
      const task = mockTasks[0]
      const email = 'test@example.com'
      
      expect(await uninitializedService.sendTaskReminder(task, email)).toBe(false)
      expect(await uninitializedService.sendTaskAssignment(task, email)).toBe(false)
      expect(await uninitializedService.sendTaskCompletion(task, [email])).toBe(false)
      expect(await uninitializedService.sendMeetingSummary(mockMeeting, [email])).toBe(false)
      expect(await uninitializedService.sendAgenda(mockMeeting, [email])).toBe(false)
      expect(await uninitializedService.sendCustomNotification({ to_email: email })).toBe(false)
    })
  })
})