import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { useMeetingStore } from '@/store/meetingStore'
import { TranscriptChunk } from '@/types'
import { format } from 'date-fns'
import { Search, Download, Copy, Sparkles } from 'lucide-react'
import { processTranscriptChunks, analyzeActionItem } from '@/utils/actionItemExtractor'
import { TaskExtractor } from '../tasks/TaskExtractor'

export function TranscriptDisplay() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const transcripts = currentMeeting?.transcripts || []
  const updateTranscripts = useMeetingStore(state => state.updateTranscripts)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [processedTranscripts, setProcessedTranscripts] = useState<TranscriptChunk[]>([])
  
  // Process transcripts to identify action items
  useEffect(() => {
    if (transcripts.length > 0) {
      const processed = processTranscriptChunks(transcripts)
      setProcessedTranscripts(processed)
      
      // Update the transcripts in the store with processed ones (with action items)
      if (JSON.stringify(processed) !== JSON.stringify(transcripts)) {
        updateTranscripts(processed)
      }
    } else {
      setProcessedTranscripts([])
    }
  }, [transcripts, updateTranscripts])
  
  // Filter transcripts based on search query
  const filteredTranscripts = searchQuery
    ? processedTranscripts.filter(t => 
        t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.speaker && t.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : processedTranscripts
  
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
                        <div className="mt-2 pt-2 border-t border-border animate-in fade-in-50 duration-300">
                          <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                            Action Items Detected
                          </h4>
                          <ul className="text-xs space-y-3">
                            {transcript.actionItems.map((item, index) => {
                              // Analyze the action item to get priority
                              const analysis = analyzeActionItem(item);
                              const priorityColor = {
                                'High': 'bg-red-500',
                                'Medium': 'bg-amber-500',
                                'Low': 'bg-blue-500'
                              }[analysis.priority || 'Medium'];
                              
                              const priorityBgColor = {
                                'High': 'bg-red-50 border-red-100',
                                'Medium': 'bg-amber-50 border-amber-100',
                                'Low': 'bg-blue-50 border-blue-100'
                              }[analysis.priority || 'Medium'];
                              
                              const priorityTextColor = {
                                'High': 'text-red-700',
                                'Medium': 'text-amber-700',
                                'Low': 'text-blue-700'
                              }[analysis.priority || 'Medium'];
                              
                              return (
                                <li 
                                  key={index} 
                                  className={`flex items-start gap-3 p-2 rounded-md border ${priorityBgColor} animate-in slide-in-from-left-5 duration-300`}
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div className={`h-3 w-3 rounded-full ${priorityColor} ring-2 ring-white`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium mb-1.5 ${priorityTextColor}`}>{item}</p>
                                    <div className="flex items-center flex-wrap gap-2">
                                      <TaskExtractor 
                                        text={item}
                                        source="transcript"
                                        priority={analysis.priority}
                                        suggestedTags={['transcript', 'meeting']}
                                        className="bg-white/80 hover:bg-white"
                                      />
                                      
                                      {analysis.priority && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/80 ${priorityTextColor} flex items-center gap-1`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m12 2 3.6 7.6L23 11l-5.5 5.4 1.3 7.6-6.8-3.7-6.8 3.7 1.3-7.6L1 11l7.4-1.4L12 2z" />
                                          </svg>
                                          {analysis.priority} Priority
                                        </span>
                                      )}
                                      
                                      {analysis.dueDate && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/80 text-gray-700 flex items-center gap-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                            <line x1="16" x2="16" y1="2" y2="6" />
                                            <line x1="8" x2="8" y1="2" y2="6" />
                                            <line x1="3" x2="21" y1="10" y2="10" />
                                          </svg>
                                          Due: {analysis.dueDate}
                                        </span>
                                      )}
                                      
                                      {analysis.assignee && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/80 text-gray-700 flex items-center gap-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                          </svg>
                                          Assignee: {analysis.assignee}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
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