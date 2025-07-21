import { AssemblyAI } from 'assemblyai'
import { getEnvConfig } from '@/lib/env'
import { ASSEMBLYAI_CONFIG } from '@/lib/constants'
import { TranscriptChunk } from '@/types'
import { generateId } from '@/lib/utils'

/**
 * Service for handling AssemblyAI transcription
 */
export class TranscriptionService {
  private client: AssemblyAI
  
  constructor() {
    const { ASSEMBLYAI_API_KEY } = getEnvConfig()
    this.client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY })
  }
  
  /**
   * Transcribe an audio file
   */
  async transcribeFile(file: File): Promise<TranscriptChunk[]> {
    try {
      const transcript = await this.client.transcripts.transcribe({
        audio: file,
        ...ASSEMBLYAI_CONFIG,
      })
      
      if (!transcript.text || !transcript.words) {
        throw new Error('Transcription failed: No text or words returned')
      }
      
      // Convert to our TranscriptChunk format
      return transcript.words.map(word => ({
        id: generateId(),
        text: word.text,
        timestamp: word.start,
        confidence: word.confidence,
      }))
    } catch (error) {
      console.error('Transcription error:', error)
      throw new Error('Failed to transcribe audio file')
    }
  }
  
  /**
   * Start real-time transcription
   */
  async startRealtimeTranscription(
    onChunkReceived: (chunk: TranscriptChunk) => void
  ): Promise<{ stop: () => void }> {
    try {
      const transcriber = this.client.realtime.transcriber({
        ...ASSEMBLYAI_CONFIG,
        sampleRate: 16000,
      })
      
      // Set up event handlers
      transcriber.on('transcript', transcript => {
        if (transcript.text) {
          onChunkReceived({
            id: generateId(),
            text: transcript.text,
            timestamp: Date.now(),
            confidence: transcript.confidence || 0,
          })
        }
      })
      
      transcriber.on('error', error => {
        console.error('Real-time transcription error:', error)
      })
      
      // Connect to the API
      await transcriber.connect()
      
      // Return stop function
      return {
        stop: async () => {
          await transcriber.close()
        }
      }
    } catch (error) {
      console.error('Failed to start real-time transcription:', error)
      throw new Error('Failed to start real-time transcription')
    }
  }
}