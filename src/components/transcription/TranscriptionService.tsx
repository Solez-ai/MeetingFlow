import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Mic, Upload, Settings, Play, Square } from 'lucide-react'
import { useMeetingStore } from '@/store/meetingStore'
import { getAssemblyClient, startRealtimeTranscription } from '@/services/transcriptionService'
import { TranscriptChunk } from '@/types'

export function TranscriptionService() {
  const [activeTab, setActiveTab] = useState<string>('live')
  const [apiKey, setApiKey] = useState<string>('')
  const [isConfigured, setIsConfigured] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  
  const {
    isTranscribing,
    setAssemblyApiKey,
    startTranscription,
    stopTranscription,
    addTranscriptChunk
  } = useMeetingStore()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const realtimeTranscriberRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // Check if API key is already set
  useEffect(() => {
    const storedApiKey = localStorage.getItem('assemblyApiKey')
    if (storedApiKey) {
      setApiKey(storedApiKey)
      setIsConfigured(true)
      try {
        setAssemblyApiKey(storedApiKey)
      } catch (error) {
        console.error('Error initializing AssemblyAI with stored API key:', error)
        setIsConfigured(false)
      }
    }
  }, [setAssemblyApiKey])
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      
      if (realtimeTranscriberRef.current) {
        realtimeTranscriberRef.current.close()
      }
    }
  }, [])
  
  // Handle API key configuration
  const handleConfigureApiKey = () => {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }
    
    try {
      setAssemblyApiKey(apiKey)
      setIsConfigured(true)
      setError(null)
      
      // Show success toast
      const event = new CustomEvent('toast', {
        detail: {
          title: 'API Key Configured',
          description: 'AssemblyAI API key has been configured successfully.',
          variant: 'success'
        }
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error('Error configuring API key:', error)
      setError('Failed to configure API key. Please check if it is valid.')
    }
  }
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0] || null)
    }
  }
  
  // Handle file upload for transcription
  const handleFileUpload = async () => {
    if (!selectedFile || !isConfigured) return
    
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    
    try {
      const client = getAssemblyClient()
      
      // Create a transcript from the audio file
      const transcript = await client.transcripts.transcribe({
        audio: selectedFile,
        speaker_labels: true
      })
      
      // Poll for transcript completion
      const pollingInterval = setInterval(async () => {
        const transcriptStatus = await client.transcripts.get(transcript.id)
        
        // Update progress
        if (transcriptStatus.status === 'processing') {
          setUploadProgress((transcriptStatus as any).percent_complete || 0)
        }
        
        // Check if completed
        if (transcriptStatus.status === 'completed') {
          clearInterval(pollingInterval)
          setIsUploading(false)
          setUploadProgress(100)
          
          // Process transcript
          if (transcriptStatus.utterances) {
            transcriptStatus.utterances.forEach((utterance) => {
              const chunk: Omit<TranscriptChunk, 'id'> = {
                text: utterance.text,
                timestamp: utterance.start,
                confidence: utterance.confidence,
                speaker: utterance.speaker,
                actionItems: []
              }
              
              addTranscriptChunk(chunk)
            })
          }
          
          // Show success toast
          const event = new CustomEvent('toast', {
            detail: {
              title: 'Transcription Complete',
              description: 'Your audio file has been transcribed successfully.',
              variant: 'success'
            }
          })
          window.dispatchEvent(event)
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          setSelectedFile(null)
        }
        
        // Check if error
        if (transcriptStatus.status === 'error') {
          clearInterval(pollingInterval)
          setIsUploading(false)
          setError('Transcription failed: ' + (transcriptStatus.error || 'Unknown error'))
        }
      }, 3000)
    } catch (error) {
      console.error('Error uploading file for transcription:', error)
      setIsUploading(false)
      setError('Failed to upload file for transcription. Please try again.')
    }
  }
  
  // Handle live transcription
  const handleToggleLiveTranscription = async () => {
    if (isTranscribing) {
      // Stop transcription
      if (realtimeTranscriberRef.current) {
        await realtimeTranscriberRef.current.close()
        realtimeTranscriberRef.current = null
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      if (audioContextRef.current) {
        await audioContextRef.current.close()
        audioContextRef.current = null
      }
      
      stopTranscription()
      
      // Show toast
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Transcription Stopped',
          description: 'Live transcription has been stopped.',
          variant: 'default'
        }
      })
      window.dispatchEvent(event)
    } else {
      // Start transcription
      try {
        setError(null)
        
        // Request microphone access
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
        
        // Initialize AudioContext
        audioContextRef.current = new AudioContext()
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
        
        // Start real-time transcription
        realtimeTranscriberRef.current = await startRealtimeTranscription((text) => {
          if (text.trim()) {
            const chunk: Omit<TranscriptChunk, 'id'> = {
              text,
              timestamp: Date.now(),
              confidence: 1.0,
              speaker: 'You',
              actionItems: []
            }
            
            addTranscriptChunk(chunk)
          }
        })
        
        // Connect audio source to transcriber
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)
        source.connect(processor)
        processor.connect(audioContextRef.current.destination)
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0)
          realtimeTranscriberRef.current.sendAudio(inputData)
        }
        
        startTranscription()
        
        // Show toast
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Transcription Started',
            description: 'Live transcription is now active.',
            variant: 'success'
          }
        })
        window.dispatchEvent(event)
      } catch (error) {
        console.error('Error starting live transcription:', error)
        setError('Failed to start live transcription. Please check microphone permissions.')
      }
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Transcription
        </CardTitle>
        <CardDescription>
          Transcribe audio from live meetings or uploaded files
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isConfigured ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">AssemblyAI API Key</Label>
              <Input 
                id="api-key"
                type="password"
                placeholder="Enter your AssemblyAI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from <a href="https://www.assemblyai.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AssemblyAI</a>
              </p>
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            
            <Button onClick={handleConfigureApiKey}>
              <Settings className="h-4 w-4 mr-2" />
              Configure API Key
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="live">Live Transcription</TabsTrigger>
              <TabsTrigger value="upload">Upload Audio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="live" className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-muted/50">
                <Button 
                  variant={isTranscribing ? "destructive" : "default"}
                  size="lg"
                  className="gap-2"
                  onClick={handleToggleLiveTranscription}
                >
                  {isTranscribing ? (
                    <>
                      <Square className="h-4 w-4" />
                      Stop Transcribing
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Start Transcribing
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground mt-2">
                  {isTranscribing 
                    ? "Listening... Speak clearly for best results." 
                    : "Click to start live transcription from your microphone."}
                </p>
              </div>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-muted/50">
                <Label 
                  htmlFor="audio-file" 
                  className="flex flex-col items-center justify-center cursor-pointer p-4"
                >
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="font-medium">Click to select audio file</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Supports MP3, WAV, M4A, and more
                  </span>
                </Label>
                
                <Input 
                  id="audio-file"
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                
                {selectedFile && (
                  <div className="mt-2 text-sm">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Processing: {uploadProgress}%
                  </p>
                </div>
              )}
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || isUploading}
                className="w-full gap-2"
              >
                <Play className="h-4 w-4" />
                {isUploading ? 'Processing...' : 'Transcribe Audio'}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}