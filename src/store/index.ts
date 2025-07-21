import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  activePanel: 'agenda' | 'notes' | 'tasks'
  isRecording: boolean
  isListening: boolean
  collaborationEnabled: boolean
}

interface SettingsState {
  autoSave: boolean
  voiceCommandsEnabled: boolean
  emailNotifications: boolean
}

interface AppState {
  // UI state
  ui: UIState
  
  // Settings
  settings: SettingsState
  
  // Actions
  setActivePanel: (panel: UIState['activePanel']) => void
  setRecording: (isRecording: boolean) => void
  setListening: (isListening: boolean) => void
  setCollaborationEnabled: (enabled: boolean) => void
  updateSettings: (settings: Partial<SettingsState>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial UI state
      ui: {
        activePanel: 'notes',
        isRecording: false,
        isListening: false,
        collaborationEnabled: false,
      },
      
      // Initial settings
      settings: {
        autoSave: true,
        voiceCommandsEnabled: false,
        emailNotifications: true,
      },
      
      // Actions
      setActivePanel: (panel) => set((state) => ({ ui: { ...state.ui, activePanel: panel } })),
      setRecording: (isRecording) => set((state) => ({ ui: { ...state.ui, isRecording } })),
      setListening: (isListening) => set((state) => ({ ui: { ...state.ui, isListening } })),
      setCollaborationEnabled: (collaborationEnabled) => 
        set((state) => ({ ui: { ...state.ui, collaborationEnabled } })),
      updateSettings: (newSettings) => 
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
    }),
    {
      name: 'meetingflow:app-state',
    }
  )
)