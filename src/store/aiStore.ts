/**
 * AI Assistant Store for MeetingFlow Buddy
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import { AIState, AIActions, AIConversation, AIMessage, AIRequest } from '@/types/ai'
import { aiService } from '@/services/aiService'
import { useMeetingStore } from './meetingStore'

interface AIStore extends AIState, AIActions {}

// Load conversations from localStorage
const loadConversationsFromStorage = (): AIConversation[] => {
  try {
    const stored = localStorage.getItem('meetingflow:ai-conversations')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading AI conversations:', error)
    return []
  }
}

// Save conversations to localStorage
const saveConversationsToStorage = (conversations: AIConversation[]) => {
  try {
    localStorage.setItem('meetingflow:ai-conversations', JSON.stringify(conversations))
  } catch (error) {
    console.error('Error saving AI conversations:', error)
  }
}



export const useAIStore = create<AIStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // State
      isOpen: false,
      isLoading: false,
      currentConversation: null,
      conversations: loadConversationsFromStorage(),
      error: null,
      hasNewInsights: false,

      // Actions
      openChat: () => {
        set(state => {
          state.isOpen = true
          state.hasNewInsights = false
        })
      },

      closeChat: () => {
        set(state => {
          state.isOpen = false
        })
      },

      sendMessage: async (content: string, type: AIRequest['type'] = 'chat') => {
        const state = get()
        
        if (!state.currentConversation) {
          get().createNewConversation()
        }

        const userMessage: AIMessage = {
          id: uuidv4(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
          type: 'text'
        }

        // Add user message to conversation
        set(state => {
          if (state.currentConversation) {
            state.currentConversation.messages.push(userMessage)
            state.currentConversation.updatedAt = new Date().toISOString()
          }
          state.isLoading = true
          state.error = null
        })

        try {
          // Get current meeting context
          const meetingStore = useMeetingStore.getState()
          const currentMeeting = meetingStore.currentMeeting

          const request: AIRequest = {
            messages: state.currentConversation?.messages || [userMessage],
            meetingContext: currentMeeting ? {
              title: currentMeeting.title,
              agenda: currentMeeting.agenda,
              notes: currentMeeting.notes,
              tasks: currentMeeting.tasks,
              transcripts: currentMeeting.transcripts
            } : undefined,
            type
          }

          const response = await aiService.sendChatMessage(request)

          const assistantMessage: AIMessage = {
            id: response.id,
            role: 'assistant',
            content: response.content,
            timestamp: new Date().toISOString(),
            type: response.type
          }

          // Add assistant response to conversation
          set(state => {
            if (state.currentConversation) {
              state.currentConversation.messages.push(assistantMessage)
              state.currentConversation.updatedAt = new Date().toISOString()
              
              // Update conversations array
              const index = state.conversations.findIndex(c => c.id === state.currentConversation!.id)
              if (index >= 0) {
                state.conversations[index] = state.currentConversation
              }
            }
            state.isLoading = false
          })

          // Handle special response types
          if (response.type === 'tasks' && response.metadata?.extractedTasks) {
            // Auto-add extracted tasks to meeting
            const addTask = meetingStore.addTask
            response.metadata.extractedTasks.forEach(task => {
              addTask({
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: 'Todo',
                tags: ['ai-generated'],
                createdFrom: 'transcript'
              })
            })
          }

          // Save to localStorage
          saveConversationsToStorage(get().conversations)

        } catch (error) {
          console.error('AI message error:', error)
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to send message'
            state.isLoading = false
          })
        }
      },

      generateSummary: async () => {
        const meetingStore = useMeetingStore.getState()
        const currentMeeting = meetingStore.currentMeeting

        if (!currentMeeting) {
          set(state => {
            state.error = 'No active meeting to summarize'
            state.isLoading = false
          })
          return
        }

        set(state => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await aiService.generateMeetingSummary(currentMeeting)
          
          const summaryMessage: AIMessage = {
            id: response.id,
            role: 'assistant',
            content: response.content,
            timestamp: new Date().toISOString(),
            type: 'summary'
          }

          // Create or update conversation with summary
          set(state => {
            if (!state.currentConversation) {
              get().createNewConversation(currentMeeting.id)
            }
            
            if (state.currentConversation) {
              state.currentConversation.messages.push(summaryMessage)
              state.currentConversation.updatedAt = new Date().toISOString()
              
              const index = state.conversations.findIndex(c => c.id === state.currentConversation!.id)
              if (index >= 0) {
                state.conversations[index] = state.currentConversation
              }
            }
            
            state.isLoading = false
            state.hasNewInsights = true
          })

          saveConversationsToStorage(get().conversations)

        } catch (error) {
          console.error('Summary generation error:', error)
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to generate summary'
            state.isLoading = false
          })
        }
      },

      extractTasks: async () => {
        const meetingStore = useMeetingStore.getState()
        const currentMeeting = meetingStore.currentMeeting

        if (!currentMeeting) {
          set(state => {
            state.error = 'No active meeting to extract tasks from'
            state.isLoading = false
          })
          return
        }

        set(state => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await aiService.extractTasksFromMeeting(currentMeeting)
          
          const tasksMessage: AIMessage = {
            id: response.id,
            role: 'assistant',
            content: response.content,
            timestamp: new Date().toISOString(),
            type: 'tasks'
          }

          // Add extracted tasks to meeting
          if (response.metadata?.extractedTasks) {
            const addTask = meetingStore.addTask
            response.metadata.extractedTasks.forEach(task => {
              addTask({
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: 'Todo',
                tags: ['ai-generated'],
                createdFrom: 'transcript'
              })
            })
          }

          // Create or update conversation with tasks
          set(state => {
            if (!state.currentConversation) {
              get().createNewConversation(currentMeeting.id)
            }
            
            if (state.currentConversation) {
              state.currentConversation.messages.push(tasksMessage)
              state.currentConversation.updatedAt = new Date().toISOString()
              
              const index = state.conversations.findIndex(c => c.id === state.currentConversation!.id)
              if (index >= 0) {
                state.conversations[index] = state.currentConversation
              }
            }
            
            state.isLoading = false
            state.hasNewInsights = true
          })

          saveConversationsToStorage(get().conversations)

        } catch (error) {
          console.error('Task extraction error:', error)
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to extract tasks'
            state.isLoading = false
          })
        }
      },

      clearError: () => {
        set(state => {
          state.error = null
        })
      },

      markInsightsRead: () => {
        set(state => {
          state.hasNewInsights = false
        })
      },

      createNewConversation: (meetingId?: string) => {
        const newConversation: AIConversation = {
          id: uuidv4(),
          messages: [],
          meetingId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        set(state => {
          state.conversations.push(newConversation)
          state.currentConversation = newConversation
        })

        saveConversationsToStorage(get().conversations)
      },

      loadConversation: (id: string) => {
        const conversation = get().conversations.find(c => c.id === id)
        if (conversation) {
          set(state => {
            state.currentConversation = conversation
          })
        }
      }
    }))
  )
)

// Subscribe to meeting changes to auto-create conversations
useMeetingStore.subscribe(
  (state) => state.currentMeetingId,
  (currentMeetingId) => {
    if (currentMeetingId) {
      const aiStore = useAIStore.getState()
      const existingConversation = aiStore.conversations.find(c => c.meetingId === currentMeetingId)
      
      if (existingConversation) {
        aiStore.loadConversation(existingConversation.id)
      } else {
        aiStore.createNewConversation(currentMeetingId)
      }
    }
  }
)