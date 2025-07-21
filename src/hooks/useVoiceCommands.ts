import { useState, useEffect, useCallback } from 'react'
import { VOICE_COMMAND_PATTERNS } from '@/lib/constants'

// Add type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface VoiceCommandOptions {
  onAddTopic?: (topic: string) => void
  onMarkAction?: (action: string) => void
  onStartRecording?: () => void
  onStopRecording?: () => void
  onNextTopic?: () => void
  onPreviousTopic?: () => void
}

/**
 * Hook for handling voice commands using the Web Speech API
 */
export function useVoiceCommands(options: VoiceCommandOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check if browser supports speech recognition
  const browserSupportsSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  
  // Process recognized speech
  const processSpeech = useCallback((transcript: string) => {
    // Check for "Add topic" command
    const addTopicMatch = transcript.match(VOICE_COMMAND_PATTERNS.ADD_TOPIC)
    if (addTopicMatch && options.onAddTopic && addTopicMatch[1]) {
      options.onAddTopic(addTopicMatch[1])
      return true
    }
    
    // Check for "Mark action item" command
    const markActionMatch = transcript.match(VOICE_COMMAND_PATTERNS.MARK_ACTION)
    if (markActionMatch && options.onMarkAction && markActionMatch[1]) {
      options.onMarkAction(markActionMatch[1])
      return true
    }
    
    // Check for "Start recording" command
    if (VOICE_COMMAND_PATTERNS.START_RECORDING.test(transcript) && options.onStartRecording) {
      options.onStartRecording()
      return true
    }
    
    // Check for "Stop recording" command
    if (VOICE_COMMAND_PATTERNS.STOP_RECORDING.test(transcript) && options.onStopRecording) {
      options.onStopRecording()
      return true
    }
    
    // Check for "Next topic" command
    if (VOICE_COMMAND_PATTERNS.NEXT_TOPIC.test(transcript) && options.onNextTopic) {
      options.onNextTopic()
      return true
    }
    
    // Check for "Previous topic" command
    if (VOICE_COMMAND_PATTERNS.PREVIOUS_TOPIC.test(transcript) && options.onPreviousTopic) {
      options.onPreviousTopic()
      return true
    }
    
    return false
  }, [options])
  
  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (!browserSupportsSpeech) {
      setError('Speech recognition is not supported in this browser')
      return
    }
    
    setIsListening(prev => !prev)
  }, [browserSupportsSpeech])
  
  // Set up speech recognition
  useEffect(() => {
    if (!browserSupportsSpeech) {
      setError('Speech recognition is not supported in this browser')
      return
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'
    
    // Handle results
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase()
      processSpeech(transcript)
    }
    
    // Handle errors
    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }
    
    // Start/stop recognition based on isListening state
    if (isListening) {
      try {
        recognition.start()
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
        setError('Failed to start speech recognition')
        setIsListening(false)
      }
    } else {
      try {
        recognition.stop()
      } catch (err) {
        // Ignore errors when stopping
      }
    }
    
    // Clean up
    return () => {
      try {
        recognition.stop()
      } catch (err) {
        // Ignore errors when stopping
      }
    }
  }, [isListening, browserSupportsSpeech, processSpeech])
  
  return {
    isListening,
    toggleListening,
    error,
    isSupported: browserSupportsSpeech,
  }
}