import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TranscriptionService } from '../transcription'
import { mockAudioFile } from '../../test/utils'

// Mock AssemblyAI
const mockTranscriber = {
  on: vi.fn(),
  connect: vi.fn(),
  close: vi.fn()
}

const mockAssemblyAI = {
  transcripts: {
    transcribe: vi.fn()
  },
  realtime: {
    transcriber: vi.fn(() => mockTranscriber)
  }
}

vi.mock('assemblyai', () => ({
  AssemblyAI: vi.fn(() => mockAssemblyAI)
}))

// Mock environment config
vi.mock('@/lib/env', () => ({
  getEnvConfig: vi.fn(() => ({
    ASSEMBLYAI_API_KEY: 'test-api-key'
  }))
}))

// Mock constants
vi.mock('@/lib/constants', () => ({
  ASSEMBLYAI_CONFIG: {
    language_code: 'en',
    punctuate: true,
    format_text: true
  }
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
  generateId: vi.fn(() => 'mock-id-' + Math.random())
}))

describe('TranscriptionService', () => {
  let transcriptionService: TranscriptionService
  
  beforeEach(() => {
    vi.clearAllMocks()
    transcriptionService = new TranscriptionService()
  })

  describe('Initialization', () => {
    it('should initialize AssemblyAI client with API key', () => {
      expect(require('assemblyai').AssemblyAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      })
    })
  })

  describe('File Transcription', () => {
    it('should transcribe audio file successfully', async () => {
      const mockTranscript = {
        text: 'Hello world',
        words: [
          { text: 'Hello', start: 0, end: 500, confidence: 0.95 },
          { text: 'world', start: 500, end: 1000, confidence: 0.98 }
        ]
      }
      
      mockAssemblyAI.transcripts.transcribe.mockResolvedValue(mockTranscript)
      
      const audioFile = mockAudioFile()
      const result = await transcriptionService.transcribeFile(audioFile)
      
      expect(mockAssemblyAI.transcripts.transcribe).toHaveBeenCalledWith({
        audio: audioFile,
        language_code: 'en',
        punctuate: true,
        format_text: true
      })
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: expect.any(String),
        text: 'Hello',
        timestamp: 0,
        confidence: 0.95
      })
      expect(result[1]).toEqual({
        id: expect.any(String),
        text: 'world',
        timestamp: 500,
        confidence: 0.98
      })
    })

    it('should handle transcription with no text', async () => {
      mockAssemblyAI.transcripts.transcribe.mockResolvedValue({
        text: null,
        words: null
      })
      
      const audioFile = mockAudioFile()
      
      await expect(transcriptionService.transcribeFile(audioFile)).rejects.toThrow(
        'Transcription failed: No text or words returned'
      )
    })

    it('should handle transcription API errors', async () => {
      mockAssemblyAI.transcripts.transcribe.mockRejectedValue(
        new Error('API Error')
      )
      
      const audioFile = mockAudioFile()
      
      await expect(transcriptionService.transcribeFile(audioFile)).rejects.toThrow(
        'Failed to transcribe audio file'
      )
    })

    it('should handle empty words array', async () => {
      mockAssemblyAI.transcripts.transcribe.mockResolvedValue({
        text: 'Hello world',
        words: []
      })
      
      const audioFile = mockAudioFile()
      const result = await transcriptionService.transcribeFile(audioFile)
      
      expect(result).toEqual([])
    })

    it('should handle words without confidence scores', async () => {
      mockAssemblyAI.transcripts.transcribe.mockResolvedValue({
        text: 'Hello world',
        words: [
          { text: 'Hello', start: 0, end: 500 }, // No confidence
          { text: 'world', start: 500, end: 1000, confidence: 0.98 }
        ]
      })
      
      const audioFile = mockAudioFile()
      const result = await transcriptionService.transcribeFile(audioFile)
      
      expect(result[0].confidence).toBeUndefined()
      expect(result[1].confidence).toBe(0.98)
    })
  })

  describe('Real-time Transcription', () => {
    it('should start real-time transcription successfully', async () => {
      const mockOnChunkReceived = vi.fn()
      
      mockTranscriber.connect.mockResolvedValue(undefined)
      
      const result = await transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      
      expect(mockAssemblyAI.realtime.transcriber).toHaveBeenCalledWith({
        language_code: 'en',
        punctuate: true,
        format_text: true,
        sampleRate: 16000
      })
      
      expect(mockTranscriber.on).toHaveBeenCalledWith('transcript', expect.any(Function))
      expect(mockTranscriber.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockTranscriber.connect).toHaveBeenCalled()
      
      expect(result).toHaveProperty('stop')
      expect(typeof result.stop).toBe('function')
    })

    it('should handle transcript events correctly', async () => {
      const mockOnChunkReceived = vi.fn()
      let transcriptHandler: (transcript: any) => void
      
      mockTranscriber.on.mockImplementation((event: string, handler: any) => {
        if (event === 'transcript') {
          transcriptHandler = handler
        }
      })
      
      await transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      
      // Simulate transcript event
      const mockTranscript = {
        text: 'Hello world',
        confidence: 0.95
      }
      
      transcriptHandler!(mockTranscript)
      
      expect(mockOnChunkReceived).toHaveBeenCalledWith({
        id: expect.any(String),
        text: 'Hello world',
        timestamp: expect.any(Number),
        confidence: 0.95
      })
    })

    it('should ignore transcript events without text', async () => {
      const mockOnChunkReceived = vi.fn()
      let transcriptHandler: (transcript: any) => void
      
      mockTranscriber.on.mockImplementation((event: string, handler: any) => {
        if (event === 'transcript') {
          transcriptHandler = handler
        }
      })
      
      await transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      
      // Simulate transcript event without text
      transcriptHandler!({ text: '', confidence: 0.95 })
      transcriptHandler!({ text: null, confidence: 0.95 })
      transcriptHandler!({ confidence: 0.95 })
      
      expect(mockOnChunkReceived).not.toHaveBeenCalled()
    })

    it('should handle transcript events without confidence', async () => {
      const mockOnChunkReceived = vi.fn()
      let transcriptHandler: (transcript: any) => void
      
      mockTranscriber.on.mockImplementation((event: string, handler: any) => {
        if (event === 'transcript') {
          transcriptHandler = handler
        }
      })
      
      await transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      
      transcriptHandler!({ text: 'Hello world' })
      
      expect(mockOnChunkReceived).toHaveBeenCalledWith({
        id: expect.any(String),
        text: 'Hello world',
        timestamp: expect.any(Number),
        confidence: 0
      })
    })

    it('should handle error events', async () => {
      const mockOnChunkReceived = vi.fn()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      let errorHandler: (error: any) => void
      
      mockTranscriber.on.mockImplementation((event: string, handler: any) => {
        if (event === 'error') {
          errorHandler = handler
        }
      })
      
      await transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      
      const mockError = new Error('Transcription error')
      errorHandler!(mockError)
      
      expect(consoleSpy).toHaveBeenCalledWith('Real-time transcription error:', mockError)
      
      consoleSpy.mockRestore()
    })

    it('should provide working stop function', async () => {
      const mockOnChunkReceived = vi.fn()
      mockTranscriber.close.mockResolvedValue(undefined)
      
      const { stop } = await transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      
      await stop()
      
      expect(mockTranscriber.close).toHaveBeenCalled()
    })

    it('should handle connection errors', async () => {
      const mockOnChunkReceived = vi.fn()
      mockTranscriber.connect.mockRejectedValue(new Error('Connection failed'))
      
      await expect(
        transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      ).rejects.toThrow('Failed to start real-time transcription')
    })

    it('should handle transcriber creation errors', async () => {
      const mockOnChunkReceived = vi.fn()
      mockAssemblyAI.realtime.transcriber.mockImplementation(() => {
        throw new Error('Transcriber creation failed')
      })
      
      await expect(
        transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      ).rejects.toThrow('Failed to start real-time transcription')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockAssemblyAI.transcripts.transcribe.mockRejectedValue(
        new Error('Network error')
      )
      
      const audioFile = mockAudioFile()
      
      await expect(transcriptionService.transcribeFile(audioFile)).rejects.toThrow(
        'Failed to transcribe audio file'
      )
    })

    it('should handle malformed API responses', async () => {
      mockAssemblyAI.transcripts.transcribe.mockResolvedValue({
        // Missing required fields
        status: 'completed'
      })
      
      const audioFile = mockAudioFile()
      
      await expect(transcriptionService.transcribeFile(audioFile)).rejects.toThrow(
        'Transcription failed: No text or words returned'
      )
    })

    it('should handle invalid audio files', async () => {
      mockAssemblyAI.transcripts.transcribe.mockRejectedValue(
        new Error('Invalid audio format')
      )
      
      const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' })
      
      await expect(transcriptionService.transcribeFile(invalidFile)).rejects.toThrow(
        'Failed to transcribe audio file'
      )
    })
  })

  describe('Configuration', () => {
    it('should use correct AssemblyAI configuration for file transcription', async () => {
      mockAssemblyAI.transcripts.transcribe.mockResolvedValue({
        text: 'test',
        words: [{ text: 'test', start: 0, end: 500, confidence: 0.95 }]
      })
      
      const audioFile = mockAudioFile()
      await transcriptionService.transcribeFile(audioFile)
      
      expect(mockAssemblyAI.transcripts.transcribe).toHaveBeenCalledWith({
        audio: audioFile,
        language_code: 'en',
        punctuate: true,
        format_text: true
      })
    })

    it('should use correct configuration for real-time transcription', async () => {
      const mockOnChunkReceived = vi.fn()
      
      await transcriptionService.startRealtimeTranscription(mockOnChunkReceived)
      
      expect(mockAssemblyAI.realtime.transcriber).toHaveBeenCalledWith({
        language_code: 'en',
        punctuate: true,
        format_text: true,
        sampleRate: 16000
      })
    })
  })
})