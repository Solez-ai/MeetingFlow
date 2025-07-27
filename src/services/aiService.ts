/**
 * AI Service for MeetingFlow Buddy using OpenRouter API
 */

import { AIRequest, AIResponse, OpenRouterRequest, OpenRouterResponse } from '@/types/ai'
import { Meeting, Task } from '@/types'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'moonshotai/kimi-k2:free'

class AIService {
  private apiKey: string | null = null

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || null
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MeetingFlow'
      },
      body: JSON.stringify({
        ...request,
        model: MODEL
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    return response.json()
  }

  async sendChatMessage(request: AIRequest): Promise<AIResponse> {
    const systemMessage = this.getSystemPrompt(request.type)
    const userMessage = this.formatUserMessage(request)

    const openRouterRequest: OpenRouterRequest = {
      model: MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        ...request.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }

    try {
      const response = await this.makeRequest(openRouterRequest)
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response from AI model')
      }

      const content = response.choices[0]?.message?.content || ''
      
      return {
        id: response.id,
        content,
        type: this.getResponseType(request.type),
        metadata: this.extractMetadata(content, request.type)
      }
    } catch (error) {
      console.error('AI Service error:', error)
      throw error
    }
  }

  private getSystemPrompt(type: AIRequest['type']): string {
    const basePrompt = `You are MeetingFlow Buddy, an AI assistant designed to help users manage their meetings efficiently. You are helpful, concise, and focused on productivity. Always provide actionable insights and maintain a friendly, professional tone.`

    switch (type) {
      case 'summary':
        return `${basePrompt}

Your task is to create concise meeting summaries. Focus on:
- Key discussion points and decisions made
- Action items and next steps
- Important insights or conclusions
- Any unresolved issues or follow-ups needed

Format your response as a structured summary with clear sections.`

      case 'extract_tasks':
        return `${basePrompt}

Your task is to extract actionable tasks from meeting content. Look for:
- Explicit action items mentioned
- Implied tasks from discussions
- Deadlines and due dates
- Task priorities and assignments

Return tasks in a structured format that can be easily converted to task objects.`

      case 'qa':
        return `${basePrompt}

Answer questions about the meeting content based on the provided context. Be specific and reference relevant parts of the meeting when possible. If information isn't available in the context, clearly state that.`

      case 'reminder':
        return `${basePrompt}

Help create and schedule reminders based on meeting content. Focus on:
- Important deadlines and due dates
- Follow-up actions needed
- Scheduled check-ins or reviews
- Time-sensitive items

Suggest appropriate reminder timing and content.`

      default:
        return basePrompt
    }
  }

  private formatUserMessage(request: AIRequest): string {
    let message = request.messages[request.messages.length - 1]?.content || ''

    if (request.meetingContext) {
      const context = request.meetingContext
      let contextStr = `Meeting Context:\n`
      contextStr += `Title: ${context.title}\n\n`

      if (context.agenda.length > 0) {
        contextStr += `Agenda:\n${context.agenda.map((item: any) => `- ${item.title} (${item.duration}min)`).join('\n')}\n\n`
      }

      if (context.notes.length > 0) {
        contextStr += `Notes:\n${context.notes.map((note: any) => `- ${note.content}`).join('\n')}\n\n`
      }

      if (context.tasks.length > 0) {
        contextStr += `Tasks:\n${context.tasks.map((task: any) => `- ${task.title} (${task.status})`).join('\n')}\n\n`
      }

      if (context.transcripts.length > 0) {
        contextStr += `Transcripts:\n${context.transcripts.map((t: any) => t.text).join('\n')}\n\n`
      }

      message = `${contextStr}User Request: ${message}`
    }

    return message
  }

  private getResponseType(requestType: AIRequest['type']): AIResponse['type'] {
    switch (requestType) {
      case 'summary': return 'summary'
      case 'extract_tasks': return 'tasks'
      case 'qa': return 'qa'
      case 'reminder': return 'reminder'
      default: return 'text'
    }
  }

  private extractMetadata(content: string, type: AIRequest['type']): AIResponse['metadata'] {
    switch (type) {
      case 'extract_tasks':
        return this.extractTasksFromContent(content)
      case 'summary':
        return this.extractSummaryFromContent(content)
      default:
        return undefined
    }
  }

  private extractTasksFromContent(content: string): { extractedTasks: Task[] } {
    // Simple regex-based task extraction
    // In a real implementation, you might want more sophisticated parsing
    const taskRegex = /(?:^|\n)[-*]\s*(.+?)(?:\s*\(([^)]+)\))?(?:\s*-\s*(High|Medium|Low))?/gm
    const tasks: any[] = []
    let match

    while ((match = taskRegex.exec(content)) !== null) {
      tasks.push({
        title: match[1]?.trim() || '',
        description: match[2]?.trim(),
        priority: (match[3] as 'High' | 'Medium' | 'Low') || 'Medium'
      })
    }

    return { extractedTasks: tasks }
  }

  private extractSummaryFromContent(content: string): { summary: any } {
    // Extract structured summary information
    const keyPointsMatch = content.match(/(?:Key Points?|Main Points?):?\s*([\s\S]*?)(?:\n\n|$)/i)
    const decisionsMatch = content.match(/(?:Decisions?|Conclusions?):?\s*([\s\S]*?)(?:\n\n|$)/i)
    const nextStepsMatch = content.match(/(?:Next Steps?|Action Items?):?\s*([\s\S]*?)(?:\n\n|$)/i)

    return {
      summary: {
        keyPoints: this.extractListItems(keyPointsMatch?.[1] || ''),
        decisions: this.extractListItems(decisionsMatch?.[1] || ''),
        nextSteps: this.extractListItems(nextStepsMatch?.[1] || '')
      }
    }
  }

  private extractListItems(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0)
  }

  // Quick action methods
  async generateMeetingSummary(meeting: Meeting): Promise<AIResponse> {
    const request: AIRequest = {
      messages: [{ 
        id: 'summary-request', 
        role: 'user', 
        content: 'Please provide a comprehensive summary of this meeting.',
        timestamp: new Date().toISOString()
      }],
      meetingContext: {
        title: meeting.title,
        agenda: meeting.agenda,
        notes: meeting.notes,
        tasks: meeting.tasks,
        transcripts: meeting.transcripts
      },
      type: 'summary'
    }

    return this.sendChatMessage(request)
  }

  async extractTasksFromMeeting(meeting: Meeting): Promise<AIResponse> {
    const request: AIRequest = {
      messages: [{ 
        id: 'extract-tasks-request', 
        role: 'user', 
        content: 'Please extract all actionable tasks and action items from this meeting content.',
        timestamp: new Date().toISOString()
      }],
      meetingContext: {
        title: meeting.title,
        agenda: meeting.agenda,
        notes: meeting.notes,
        tasks: meeting.tasks,
        transcripts: meeting.transcripts
      },
      type: 'extract_tasks'
    }

    return this.sendChatMessage(request)
  }

  async answerQuestion(question: string, meeting: Meeting): Promise<AIResponse> {
    const request: AIRequest = {
      messages: [{ 
        id: 'qa-request', 
        role: 'user', 
        content: question,
        timestamp: new Date().toISOString()
      }],
      meetingContext: {
        title: meeting.title,
        agenda: meeting.agenda,
        notes: meeting.notes,
        tasks: meeting.tasks,
        transcripts: meeting.transcripts
      },
      type: 'qa'
    }

    return this.sendChatMessage(request)
  }
}

export const aiService = new AIService()