import { AssemblyAI } from 'assemblyai'

// Initialize AssemblyAI client
let assemblyClient: AssemblyAI | null = null

/**
 * Initialize the AssemblyAI client with the API key
 * @param apiKey AssemblyAI API key
 */
export const initializeAssemblyAI = (apiKey: string): void => {
  if (!apiKey) {
    throw new Error('AssemblyAI API key is required')
  }
  
  assemblyClient = new AssemblyAI({
    apiKey
  })
}

/**
 * Get the AssemblyAI client instance
 * @returns AssemblyAI client instance
 */
export const getAssemblyClient = (): AssemblyAI => {
  if (!assemblyClient) {
    throw new Error('AssemblyAI client not initialized. Call initializeAssemblyAI first.')
  }
  return assemblyClient
}

/**
 * Transcribe an audio file
 * @param audioFile Audio file to transcribe
 * @returns Transcript ID
 */
export const transcribeAudioFile = async (audioFile: File): Promise<string> => {
  const client = getAssemblyClient()
  
  try {
    // Create a transcript from the audio file
    const transcript = await client.transcripts.transcribe({
      audio: audioFile,
      speaker_labels: true
    })
    
    return transcript.id
  } catch (error) {
    console.error('Error transcribing audio file:', error)
    throw error
  }
}

/**
 * Get the status of a transcript
 * @param transcriptId Transcript ID
 * @returns Transcript status
 */
export const getTranscriptStatus = async (transcriptId: string) => {
  const client = getAssemblyClient()
  
  try {
    const transcript = await client.transcripts.get(transcriptId)
    return transcript
  } catch (error) {
    console.error('Error getting transcript status:', error)
    throw error
  }
}

/**
 * Start real-time transcription
 * @param onTranscript Callback for receiving transcript updates
 * @returns RealtimeTranscriber instance
 */
export const startRealtimeTranscription = async (onTranscript: (text: string) => void) => {
  const client = getAssemblyClient()
  
  try {
    const realtimeTranscriber = client.realtime.transcriber({
      sampleRate: 16000,
    })
    
    realtimeTranscriber.on('transcript', (transcript) => {
      onTranscript(transcript.text)
    })
    
    return realtimeTranscriber
  } catch (error) {
    console.error('Error starting real-time transcription:', error)
    throw error
  }
}