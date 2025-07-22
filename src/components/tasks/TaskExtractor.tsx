import { useState } from 'react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useMeetingStore } from '@/store/meetingStore'
import { isLikelyActionItem } from '@/utils/taskExtractor'

interface TaskExtractorProps {
  text: string
  source: 'notes' | 'transcript'
  onExtracted?: () => void
}

export function TaskExtractor({ text, source, onExtracted }: TaskExtractorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isCreated, setIsCreated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const extractTaskFromText = useMeetingStore(state => state.extractTaskFromText)
  
  // Check if the text is likely an action item
  const isActionItem = isLikelyActionItem(text)
  
  // Handle task creation
  const handleCreateTask = async () => {
    try {
      setIsCreating(true)
      setError(null)
      
      const taskId = await extractTaskFromText(text, source)
      
      if (taskId) {
        setIsCreated(true)
        setTimeout(() => {
          setIsCreated(false)
        }, 3000)
        
        if (onExtracted) {
          onExtracted()
        }
      } else {
        setError('Failed to create task')
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred')
    } finally {
      setIsCreating(false)
    }
  }
  
  // If not likely an action item, don't render anything
  if (!isActionItem) {
    return null
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20"
        >
          Make Task
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Create Task</h4>
            <p className="text-xs text-muted-foreground">
              Create a task from this text:
            </p>
            <div className="bg-muted p-2 rounded text-xs">
              {text}
            </div>
          </div>
          
          {isCreated ? (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Task created successfully!</span>
            </div>
          ) : error ? (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          ) : (
            <Button 
              onClick={handleCreateTask} 
              disabled={isCreating}
              className="w-full"
              size="sm"
            >
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}