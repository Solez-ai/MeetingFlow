/**
 * MeetingFlow Buddy - AI Assistant Component
 */

import React, { useState, useRef, useEffect } from 'react'
import { useAIStore } from '@/store/aiStore'
import { useMeetingStore } from '@/store/meetingStore'
import { AIMessage } from '@/types/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  X, 
  Send, 
  FileText, 
  CheckSquare, 
  Loader2,
  Sparkles,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const AIAssistant: React.FC = () => {
  const {
    isOpen,
    isLoading,
    currentConversation,
    error,
    hasNewInsights,
    openChat,
    closeChat,
    sendMessage,
    generateSummary,
    extractTasks,
    clearError
  } = useAIStore()

  const { currentMeeting } = useMeetingStore()
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Simulate typing indicator
  useEffect(() => {
    if (isLoading) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    
    try {
      await sendMessage(message)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = async (action: 'summary' | 'tasks') => {
    try {
      if (action === 'summary') {
        await generateSummary()
      } else if (action === 'tasks') {
        await extractTasks()
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const renderMessage = (message: AIMessage) => {
    const isUser = message.role === 'user'
    
    return (
      <div
        key={message.id}
        className={cn(
          'flex gap-3 mb-4',
          isUser ? 'justify-end' : 'justify-start'
        )}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
        )}
        
        <div
          className={cn(
            'max-w-[80%] rounded-lg px-3 py-2 text-sm',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 border'
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {message.type && message.type !== 'text' && (
            <Badge 
              variant="secondary" 
              className="mt-2 text-xs"
            >
              {message.type}
            </Badge>
          )}
          
          <div 
            className={cn(
              'text-xs mt-1 opacity-70',
              isUser ? 'text-blue-100' : 'text-gray-500'
            )}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">You</span>
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={openChat}
              className={cn(
                'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg',
                'bg-white hover:bg-gray-50 border-2 border-gray-200',
                'transition-all duration-300 hover:scale-110',
                'animate-pulse-gentle z-50'
              )}
              size="icon"
            >
              <div className="relative">
                <img
                  src="/chatbot-chat-message-vectorart_78370-4104-Photoroom.png"
                  alt="MeetingFlow Buddy"
                  className="w-8 h-8"
                />
                {hasNewInsights && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Meet MeetingFlow Buddy: AI assistant to summarize meetings & more.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={closeChat}
      />
      
      {/* Chat Panel */}
      <Card className={cn(
        'relative w-96 h-[600px] flex flex-col',
        'animate-slide-up-fade-in shadow-2xl'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <img
                src="/chatbot-chat-message-vectorart_78370-4104-Photoroom.png"
                alt="MeetingFlow Buddy"
                className="w-6 h-6"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">MeetingFlow Buddy</h3>
              <p className="text-xs text-gray-500">
                {currentMeeting ? `Helping with: ${currentMeeting.title}` : 'AI Assistant'}
              </p>
            </div>
          </div>
          <Button
            onClick={closeChat}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        {currentMeeting && (
          <div className="p-3 border-b bg-gray-50">
            <div className="flex gap-2">
              <Button
                onClick={() => handleQuickAction('summary')}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <FileText className="w-3 h-3 mr-1" />
                Summarize Meeting
              </Button>
              <Button
                onClick={() => handleQuickAction('tasks')}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <CheckSquare className="w-3 h-3 mr-1" />
                Extract Tasks
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation?.messages.length ? (
            <div className="text-center text-gray-500 mt-8">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-sm">
                Hi! I'm MeetingFlow Buddy. I can help you summarize meetings, extract tasks, and answer questions about your meeting content.
              </p>
              {currentMeeting && (
                <p className="text-xs mt-2">
                  Try asking me about "{currentMeeting.title}" or use the quick actions above!
                </p>
              )}
            </div>
          ) : (
            currentConversation.messages.map(renderMessage)
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 border">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your meeting..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}