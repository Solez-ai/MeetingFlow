import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('sessionStorage', sessionStorageMock)

// Mock Web Speech API
const mockSpeechRecognition = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
}))

vi.stubGlobal('SpeechRecognition', mockSpeechRecognition)
vi.stubGlobal('webkitSpeechRecognition', mockSpeechRecognition)

// Mock MediaDevices API
const mockMediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  }),
  enumerateDevices: vi.fn().mockResolvedValue([]),
}
vi.stubGlobal('navigator', {
  ...navigator,
  mediaDevices: mockMediaDevices,
})

// Mock WebRTC
const mockRTCPeerConnection = vi.fn(() => ({
  createOffer: vi.fn().mockResolvedValue({}),
  createAnswer: vi.fn().mockResolvedValue({}),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  createDataChannel: vi.fn(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
vi.stubGlobal('RTCPeerConnection', mockRTCPeerConnection)

// Mock environment variables
vi.stubEnv('VITE_ASSEMBLYAI_API_KEY', 'test-api-key')
vi.stubEnv('VITE_EMAILJS_USER_ID', 'test-user-id')
vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'test-service-id')
vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'test-template-id')

// Mock window.print
vi.stubGlobal('print', vi.fn())

// Mock URL.createObjectURL and URL constructor
const mockURL = vi.fn((url: string) => {
  try {
    return new globalThis.URL(url)
  } catch {
    return {
      searchParams: {
        get: vi.fn(() => null)
      }
    }
  }
})

vi.stubGlobal('URL', {
  ...globalThis.URL,
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
})

// Also mock the URL constructor directly
Object.defineProperty(globalThis, 'URL', {
  value: mockURL,
  writable: true,
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockReturnValue(undefined)
  localStorageMock.removeItem.mockReturnValue(undefined)
  localStorageMock.clear.mockReturnValue(undefined)
})