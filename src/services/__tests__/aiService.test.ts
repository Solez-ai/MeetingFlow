/**
 * Tests for AI Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiService } from '../aiService'
import { Meeting } from '@/types'

// Mock fetch
global.fetch = vi.fn()

const mockMeeting: Meeting = {
  id: 'test-meeting',
  title: 'Test Meeting',
  startTime: '2024-01-01T10:00:00Z',
  agenda: [
    { id: '1', title: 'Discussion Topic', duration: 30, order: 0 }
  ],
  notes: [
    { id: '1', type: 'paragraph', content: 'Important discussion point', timestamp: '2024-01-01T10:00:00Z' }
  ],
  tasks: [
    { 
      id: '1', 
      title: 'Follow up task', 
      status: 'Todo', 
      priority: 'Medium', 
      tags: [], 
      created: '2024-01-01T10:00:00Z',
      createdFrom: 'manual'
    }
  ],
  transcripts: [
    { id: '1', text: 'We need to follow up on the project timeline', timestamp: 1704110400000, confidence: 0.95 }
  ],
  metadata: {
    duration: 60,
    participants: ['John', 'Jane'],
    tags: ['project', 'planning']
  }
}

const mockOpenRouterResponse = {
  id: 'test-response',
  object: 'chat.completion',
  created: 1704110400,
  model: 'moonshotai/kimi-k2:free',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a test AI response'
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 50,
    completion_tokens: 20,
    total_tokens: 70
  }
}

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    aiService.setApiKey('test-api-key')
  })

  describe('sendChatMessage', () => {
    it('should send a chat message and return response', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenRouterResponse
      } as Response)

      const request = {
        messages: [
          {
            id: 'test-msg',
            role: 'user' as const,
            content: 'Hello AI',
            timestamp: '2024-01-01T10:00:00Z'
          }
        ],
        type: 'chat' as const
      }

      const response = await aiService.sendChatMessage(request)

      expect(response).toEqual({
        id: 'test-response',
        content: 'This is a test AI response',
        type: 'text',
        metadata: undefined
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should handle API errors', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } })
      } as Response)

      const request = {
        messages: [
          {
            id: 'test-msg',
            role: 'user' as const,
            content: 'Hello AI',
            timestamp: '2024-01-01T10:00:00Z'
          }
        ],
        type: 'chat' as const
      }

      await expect(aiService.sendChatMessage(request)).rejects.toThrow('OpenRouter API error: 401 - Invalid API key')
    })

    it('should throw error when API key is not set', async () => {
      aiService.setApiKey('')

      const request = {
        messages: [
          {
            id: 'test-msg',
            role: 'user' as const,
            content: 'Hello AI',
            timestamp: '2024-01-01T10:00:00Z'
          }
        ],
        type: 'chat' as const
      }

      await expect(aiService.sendChatMessage(request)).rejects.toThrow('OpenRouter API key not configured')
    })
  })

  describe('generateMeetingSummary', () => {
    it('should generate a meeting summary', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockOpenRouterResponse,
          choices: [
            {
              ...mockOpenRouterResponse.choices[0],
              message: {
                role: 'assistant',
                content: 'Meeting Summary:\n\nKey Points:\n- Important discussion about project timeline\n\nDecisions:\n- Follow up required\n\nNext Steps:\n- Schedule follow-up meeting'
              }
            }
          ]
        })
      } as Response)

      const response = await aiService.generateMeetingSummary(mockMeeting)

      expect(response.type).toBe('summary')
      expect(response.content).toContain('Meeting Summary')
      expect(response.metadata?.summary).toBeDefined()
    })
  })

  describe('extractTasksFromMeeting', () => {
    it('should extract tasks from meeting content', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockOpenRouterResponse,
          choices: [
            {
              ...mockOpenRouterResponse.choices[0],
              message: {
                role: 'assistant',
                content: 'Extracted Tasks:\n\n- Follow up on project timeline (High priority)\n- Schedule next meeting - Medium'
              }
            }
          ]
        })
      } as Response)

      const response = await aiService.extractTasksFromMeeting(mockMeeting)

      expect(response.type).toBe('tasks')
      expect(response.metadata?.extractedTasks).toBeDefined()
      expect(response.metadata?.extractedTasks?.length).toBeGreaterThan(0)
    })
  })

  describe('answerQuestion', () => {
    it('should answer questions about meeting content', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenRouterResponse
      } as Response)

      const response = await aiService.answerQuestion('What was discussed in the meeting?', mockMeeting)

      expect(response.type).toBe('qa')
      expect(response.content).toBe('This is a test AI response')
    })
  })
})