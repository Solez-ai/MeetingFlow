import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { useMeetingStore } from '@/store/meetingStore'
import { extractActionItems } from '@/utils/actionItemExtractor'
import { Sparkles, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'

/**
 * Component for extracting action items from transcripts and converting them to tasks
 */
export function ActionItemExtractor() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const transcripts = currentMeeting?.transcripts || []
  const addTask = useMeetingStore(state => state.addTask)
  
  const [extractedItems, setExtractedItems] = useState<ReturnType<typeof extractActionItems>>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [createdTaskIds, setCreatedTaskIds] = useState<string[]>([])
  
  // Extract action items when transcripts change
  const handleExtractActionItems = () => {
    setIsExtracting(true)
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        const items = extractActionItems(transcripts)
        setExtractedItems(items)
        
        // Pre-select all high confidence items
        const selected: Record<string, boolean> = {}
        items.forEach((item, index) => {
          selected[index] = item.confidence > 0.6
        })
        setSelectedItems(selected)
      } catch (error) {
        console.error('Error extracting action items:', error)
      } finally {
        setIsExtracting(false)
      }
    }, 100)
  }
  
  // Toggle selection of an item
  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  
  // Create tasks from selected items
  const createTasksFromSelected = () => {
    const createdIds: string[] = []
    
    Object.entries(selectedItems).forEach(([indexStr, isSelected]) => {
      if (isSelected) {
        const index = parseInt(indexStr)
        const item = extractedItems[index]
        
        if (item) {
          const taskId = addTask({
            title: item.text,
            priority: item.priority,
            status: 'Todo',
            tags: [...item.tags, 'transcript', 'auto-extracted'],
            dueDate: item.dueDate,
            createdFrom: 'transcript',
            description: `Extracted from transcript at ${new Date(item.timestamp).toLocaleTimeString()}`
          })
          
          if (taskId) {
            createdIds.push(taskId)
          }
        }
      }
    })
    
    if (createdIds.length > 0) {
      setCreatedTaskIds(createdIds)
      
      // Show success toast
      const event = new CustomEvent('toast', {
        detail: {
          title: `${createdIds.length} tasks created`,
          description: 'Action items have been converted to tasks',
          variant: 'success'
        }
      })
      window.dispatchEvent(event)
      
      // Show confetti
      const confettiEvent = new CustomEvent('confetti')
      window.dispatchEvent(confettiEvent)
      
      // Clear selections
      setSelectedItems({})
    }
  }
  
  // Reset the extraction
  const resetExtraction = () => {
    setExtractedItems([])
    setSelectedItems({})
    setCreatedTaskIds([])
  }
  
  // Count selected items
  const selectedCount = Object.values(selectedItems).filter(Boolean).length
  
  // Group items by confidence
  const highConfidenceItems = extractedItems.filter(item => item.confidence > 0.7)
  const mediumConfidenceItems = extractedItems.filter(item => item.confidence > 0.5 && item.confidence <= 0.7)
  const lowConfidenceItems = extractedItems.filter(item => item.confidence <= 0.5)
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Action Item Extraction
            </CardTitle>
            <CardDescription>
              Automatically extract action items from transcripts
            </CardDescription>
          </div>
          
          {extractedItems.length > 0 ? (
            <Button variant="outline" size="sm" onClick={resetExtraction}>
              Reset
            </Button>
          ) : (
            <Button 
              onClick={handleExtractActionItems} 
              disabled={isExtracting || transcripts.length === 0}
              size="sm"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract Action Items
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted rounded-full p-3 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                <path d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-medium mb-1">No Transcripts Available</h3>
            <p className="text-sm text-muted-foreground">
              Start recording or upload an audio file to generate transcripts.
            </p>
          </div>
        ) : extractedItems.length === 0 && !isExtracting ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Extract Action Items</h3>
            <p className="text-sm text-muted-foreground">
              Click the "Extract Action Items" button to analyze your transcripts.
            </p>
          </div>
        ) : isExtracting ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <h3 className="font-medium mb-1">Analyzing Transcripts</h3>
            <p className="text-sm text-muted-foreground">
              Looking for action items in your meeting transcripts...
            </p>
          </div>
        ) : createdTaskIds.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium mb-1">Tasks Created Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {createdTaskIds.length} action {createdTaskIds.length === 1 ? 'item has' : 'items have'} been converted to tasks.
            </p>
            <Button variant="outline" size="sm" onClick={resetExtraction}>
              Extract More
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Found {extractedItems.length} potential action {extractedItems.length === 1 ? 'item' : 'items'}
              </div>
              
              <Button
                size="sm"
                disabled={selectedCount === 0}
                onClick={createTasksFromSelected}
                className="gap-1.5"
              >
                Create {selectedCount} {selectedCount === 1 ? 'Task' : 'Tasks'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {highConfidenceItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Badge variant="default" className="bg-green-500">High Confidence</Badge>
                    </h4>
                    <div className="space-y-2">
                      {highConfidenceItems.map((item, index) => {
                        const itemIndex = extractedItems.findIndex(i => i === item)
                        return (
                          <ActionItemCard
                            key={`high-${index}`}
                            item={item}
                            isSelected={!!selectedItems[itemIndex]}
                            onToggle={() => toggleItemSelection(itemIndex)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {mediumConfidenceItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Badge variant="default" className="bg-amber-500">Medium Confidence</Badge>
                    </h4>
                    <div className="space-y-2">
                      {mediumConfidenceItems.map((item, index) => {
                        const itemIndex = extractedItems.findIndex(i => i === item)
                        return (
                          <ActionItemCard
                            key={`medium-${index}`}
                            item={item}
                            isSelected={!!selectedItems[itemIndex]}
                            onToggle={() => toggleItemSelection(itemIndex)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {lowConfidenceItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Badge variant="default" className="bg-blue-500">Low Confidence</Badge>
                    </h4>
                    <div className="space-y-2">
                      {lowConfidenceItems.map((item, index) => {
                        const itemIndex = extractedItems.findIndex(i => i === item)
                        return (
                          <ActionItemCard
                            key={`low-${index}`}
                            item={item}
                            isSelected={!!selectedItems[itemIndex]}
                            onToggle={() => toggleItemSelection(itemIndex)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Card component for displaying an action item
interface ActionItemCardProps {
  item: ReturnType<typeof extractActionItems>[0]
  isSelected: boolean
  onToggle: () => void
}

function ActionItemCard({ item, isSelected, onToggle }: ActionItemCardProps) {
  const priorityColor = {
    'High': 'bg-red-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-blue-500'
  }[item.priority]
  
  const timestamp = new Date(item.timestamp).toLocaleTimeString()
  
  return (
    <div 
      className={cn(
        "border rounded-lg p-3 transition-colors",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-5 w-5 rounded-full p-0.5 flex-shrink-0 mt-0.5",
            isSelected && "bg-primary text-primary-foreground"
          )}
          onClick={onToggle}
        >
          <CheckCircle className="h-4 w-4" />
          <span className="sr-only">
            {isSelected ? 'Deselect' : 'Select'} action item
          </span>
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("w-2 h-2 rounded-full", priorityColor)} />
            <p className="text-sm font-medium">{item.text}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{timestamp}</span>
            
            {item.dueDate && (
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM2.5 3C2.22386 3 2 3.22386 2 3.5V5H13V3.5C13 3.22386 12.7761 3 12.5 3H2.5ZM13 6H2V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6ZM7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5ZM9.5 7C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7ZM11 7.5C11 7.22386 11.2239 7 11.5 7C11.7761 7 12 7.22386 12 7.5C12 7.77614 11.7761 8 11.5 8C11.2239 8 11 7.77614 11 7.5ZM3.5 9C3.22386 9 3 9.22386 3 9.5C3 9.77614 3.22386 10 3.5 10C3.77614 10 4 9.77614 4 9.5C4 9.22386 3.77614 9 3.5 9ZM5 9.5C5 9.22386 5.22386 9 5.5 9C5.77614 9 6 9.22386 6 9.5C6 9.77614 5.77614 10 5.5 10C5.22386 10 5 9.77614 5 9.5ZM7.5 9C7.22386 9 7 9.22386 7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5C8 9.22386 7.77614 9 7.5 9ZM9 9.5C9 9.22386 9.22386 9 9.5 9C9.77614 9 10 9.22386 10 9.5C10 9.77614 9.77614 10 9.5 10C9.22386 10 9 9.77614 9 9.5ZM11.5 9C11.2239 9 11 9.22386 11 9.5C11 9.77614 11.2239 10 11.5 10C11.7761 10 12 9.77614 12 9.5C12 9.22386 11.7761 9 11.5 9ZM3 11.5C3 11.2239 3.22386 11 3.5 11C3.77614 11 4 11.2239 4 11.5C4 11.7761 3.77614 12 3.5 12C3.22386 12 3 11.7761 3 11.5ZM5.5 11C5.22386 11 5 11.2239 5 11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5C6 11.2239 5.77614 11 5.5 11ZM7 11.5C7 11.2239 7.22386 11 7.5 11C7.77614 11 8 11.2239 8 11.5C8 11.7761 7.77614 12 7.5 12C7.22386 12 7 11.7761 7 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Due: {item.dueDate}
              </span>
            )}
            
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="bg-muted px-1.5 py-0.5 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}