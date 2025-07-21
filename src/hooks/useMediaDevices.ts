import { useState, useEffect, useCallback } from 'react'

interface MediaDevicesState {
  hasAudioPermission: boolean
  isRecording: boolean
  audioDevices: MediaDeviceInfo[]
  selectedDeviceId: string | null
  error: string | null
}

/**
 * Hook for handling media devices and audio recording
 */
export function useMediaDevices() {
  const [state, setState] = useState<MediaDevicesState>({
    hasAudioPermission: false,
    isRecording: false,
    audioDevices: [],
    selectedDeviceId: null,
    error: null,
  })
  
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  
  // Get available audio devices
  const getAudioDevices = useCallback(async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Get list of devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput')
      
      setState(prev => ({
        ...prev,
        hasAudioPermission: true,
        audioDevices: audioInputDevices,
        selectedDeviceId: audioInputDevices[0]?.deviceId || null,
        error: null,
      }))
    } catch (error) {
      console.error('Error accessing media devices:', error)
      setState(prev => ({
        ...prev,
        hasAudioPermission: false,
        error: 'Permission to access microphone was denied',
      }))
    }
  }, [])
  
  // Select audio device
  const selectAudioDevice = useCallback((deviceId: string) => {
    setState(prev => ({
      ...prev,
      selectedDeviceId: deviceId,
    }))
  }, [])
  
  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Stop any existing recording
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: state.selectedDeviceId ? { exact: state.selectedDeviceId } : undefined,
        },
      })
      
      // Create new media recorder
      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      setAudioChunks([])
      
      // Set up event handlers
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data])
        }
      }
      
      // Start recording
      recorder.start(1000) // Collect data every second
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
      }))
    } catch (error) {
      console.error('Error starting recording:', error)
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: 'Failed to start recording',
      }))
    }
  }, [mediaRecorder, state.selectedDeviceId])
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      
      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      
      setState(prev => ({
        ...prev,
        isRecording: false,
      }))
    }
  }, [mediaRecorder])
  
  // Get recorded audio as blob
  const getRecordedAudio = useCallback(() => {
    if (audioChunks.length === 0) return null
    
    return new Blob(audioChunks, { type: 'audio/webm' })
  }, [audioChunks])
  
  // Initialize on mount
  useEffect(() => {
    getAudioDevices()
    
    // Listen for device changes
    const handleDeviceChange = () => {
      getAudioDevices()
    }
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
      
      // Stop recording if component unmounts
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [getAudioDevices, mediaRecorder])
  
  return {
    ...state,
    getAudioDevices,
    selectAudioDevice,
    startRecording,
    stopRecording,
    getRecordedAudio,
  }
}