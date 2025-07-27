import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock functions for common APIs
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get store() {
      return { ...store }
    }
  }
}

export const mockMediaStream = () => ({
  getTracks: vi.fn(() => [
    {
      stop: vi.fn(),
      kind: 'audio',
      enabled: true,
    }
  ]),
  getAudioTracks: vi.fn(() => [
    {
      stop: vi.fn(),
      kind: 'audio',
      enabled: true,
    }
  ]),
  getVideoTracks: vi.fn(() => []),
})

export const mockSpeechRecognitionEvent = (transcript: string, isFinal = true) => ({
  results: [
    [
      {
        transcript,
        confidence: 0.9,
        isFinal,
      }
    ]
  ],
  resultIndex: 0,
})

export const mockFile = (name: string, type: string, content = 'mock file content') => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

export const mockAudioFile = () => mockFile('test-audio.wav', 'audio/wav')

export const mockWebRTCConnection = () => ({
  createOffer: vi.fn().mockResolvedValue({
    type: 'offer',
    sdp: 'mock-sdp-offer',
  }),
  createAnswer: vi.fn().mockResolvedValue({
    type: 'answer',
    sdp: 'mock-sdp-answer',
  }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  createDataChannel: vi.fn(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 'open',
  })),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  connectionState: 'connected',
})

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockAssemblyAIResponse = {
  id: 'transcript-123',
  status: 'completed',
  text: 'This is a mock transcription result.',
  confidence: 0.95,
  words: [
    { text: 'This', start: 0, end: 500, confidence: 0.98 },
    { text: 'is', start: 500, end: 700, confidence: 0.95 },
    { text: 'a', start: 700, end: 800, confidence: 0.92 },
    { text: 'mock', start: 800, end: 1200, confidence: 0.96 },
    { text: 'transcription', start: 1200, end: 2000, confidence: 0.94 },
    { text: 'result', start: 2000, end: 2500, confidence: 0.97 },
  ],
}

export const mockEmailJSResponse = {
  status: 200,
  text: 'OK',
}