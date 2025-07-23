import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { useMeetingStore } from '@/store/meetingStore'
import { TranscriptChunk } from '@/types'
import { format } from 'date-fns'
import { Search, Download, Copy } from 'lucide-react'

export function TranscriptDisplay() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const transcripts = currentMeeting?.transcripts || []
  
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter transcripts based on search query
  const filteredTranscripts = searchQuery
    ? transcripts.filter(t => 
        t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.speaker && t.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : transcripts
  
  // Group transcripts by speaker
  const groupedTranscripts: { [key: string]: TranscriptChunk[] } = {}
  
  filteredTranscripts.forEach(transcript => {
    const speaker = transcript.speaker || 'Unknown'
    if (!groupedTranscripts[speaker]) {
      groupedTranscripts[speaker] = []
    }
    groupedTranscripts[speaker].push(transcript)
  })
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return format(date, 'HH:mm:ss')
  }
  
  // Copy transcript to clipboard
  const copyTranscript = () => {
    const text = transcripts
      .map(t => `[${formatTimestamp(t.timestamp)}] ${t.speaker || 'Unknown'}: ${t.text}`)
      .join('\n\n')
    
    navigator.clipboard.writeText(text)
    
    // Show success toast
    const event = new CustomEvent('toast', {
      detail: {
        title: 'Copied to Clipboard',
        description: 'Transcript has been copied to clipboard.',
        variant: 'success'
      }
    })
    window.dispatchEvent(event)
  }
  
  // Download transcript as text file
  const downloadTranscript = () => {
    const text = transcripts
      .map(t => `[${formatTimestamp(t.timestamp)}] ${t.speaker || 'Unknown'}: ${t.text}`)
      .join('\n\n')
    
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              {transcripts.length > 0 
                ? `${transcripts.length} transcript entries` 
                : 'No transcript available'}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyTranscript}
              disabled={transcripts.length === 0}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy transcript</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={downloadTranscript}
              disabled={transcripts.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download transcript</span>
            </Button>
          </div>
        </div>
        
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        {transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-muted rounded-full p-3 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                <path d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-medium mb-1">No Transcript Available</h3>
            <p className="text-sm text-muted-foreground">
              Start recording or upload an audio file to generate a transcript.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {Object.entries(groupedTranscripts).map(([speaker, speakerTranscripts]) => (
                <div key={speaker} className="space-y-2">
                  <h3 className="text-sm font-medium">{speaker}</h3>
                  
                  {speakerTranscripts.map((transcript) => (
                    <div 
                      key={transcript.id} 
                      className="bg-muted/50 rounded-lg p-3 space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(transcript.timestamp)}
                        </span>
                        
                        {transcript.confidence && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(transcript.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm">{transcript.text}</p>
                      
                      {transcript.actionItems && transcript.actionItems.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <h4 className="text-xs font-medium mb-1">Action Items:</h4>
                          <ul className="text-xs space-y-1">
                            {transcript.actionItems.map((item, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                                  <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}