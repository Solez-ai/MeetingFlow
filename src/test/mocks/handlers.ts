import { http, HttpResponse } from 'msw'
import { mockAssemblyAIResponse, mockEmailJSResponse } from '../utils'

export const handlers = [
  // AssemblyAI API mocks
  http.post('https://api.assemblyai.com/v2/upload', () => {
    return HttpResponse.json({
      upload_url: 'https://cdn.assemblyai.com/upload/mock-file-id'
    })
  }),

  http.post('https://api.assemblyai.com/v2/transcript', () => {
    return HttpResponse.json({
      id: 'transcript-123',
      status: 'queued',
      audio_url: 'https://cdn.assemblyai.com/upload/mock-file-id',
    })
  }),

  http.get('https://api.assemblyai.com/v2/transcript/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      ...mockAssemblyAIResponse,
      id,
    })
  }),

  // EmailJS API mocks
  http.post('https://api.emailjs.com/api/v1.0/email/send', () => {
    return HttpResponse.json(mockEmailJSResponse)
  }),

  // WebSocket signaling server mock (for collaboration)
  http.get('ws://localhost:3001', () => {
    return HttpResponse.json({ message: 'WebSocket connection established' })
  }),
]