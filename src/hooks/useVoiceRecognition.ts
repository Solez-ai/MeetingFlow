import { useState, useEffect, useRef, useCallback } from 'react'
import { VoiceRecognitionState } from '@/types/voice'

interface UseVoiceRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (transcript: string, confidence: number) => void
  onError?: (error: string) => void
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError
  } = options

  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
    lastTranscript: '',
    confidence: 0
  })

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Initialize speech recognition
  useEffect(() => {
    if (!state.isSupported) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = continuous
      recognitionRef.current.interimResults = interimResults
      recognitionRef.current.lang = language

      recognitionRef.current.onresult = (event: any) => {
        let transcript = ''
        let confidence = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            transcript += result[0].transcript
            confidence = result[0].confidence
          }
        }

        if (transcript.trim()) {
          setState(prev => ({
            ...prev,
            lastTranscript: transcript.trim(),
            confidence,
            error: undefined
          }))

          onResult?.(transcript.trim(), confidence)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        const errorMessage = `Speech recognition error: ${event.error}`
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isListening: false
        }))
        onError?.(errorMessage)
      }

      recognitionRef.current.onend = () => {
        setState(prev => ({
          ...prev,
          isListening: false
        }))
      }

      recognitionRef.current.onstart = () => {
        setState(prev => ({
          ...prev,
          isListening: true,
          error: undefined
        }))
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [continuous, interimResults, language, onResult, onError, state.isSupported])

  const startListening = useCallback(() => {
    if (!state.isSupported || !recognitionRef.current) {
      onError?.('Speech recognition is not supported in this browser')
      return
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      const errorMessage = 'Failed to start speech recognition'
      setState(prev => ({
        ...prev,
        error: errorMessage
      }))
      onError?.(errorMessage)
    }
  }, [state.isSupported, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [state.isListening, startListening, stopListening])

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening
  }
}