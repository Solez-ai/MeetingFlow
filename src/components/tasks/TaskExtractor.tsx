import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CheckCircle, AlertCircle, Sparkles, Loader2, Clock, Tag } from 'lucide-react'
import { useMeetingStore } from '@/store/meetingStore'
import { isLikelyActionItem } from '@/utils/taskExtractor'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskExtractorProps {
  text: string
  source: 'notes' | 'transcript'
  onExtracted?: () => void
  className?: string
  priority?: 'Low' | 'Medium' | 'High'
  suggestedTags?: string[]
}

export function TaskExtractor({
  text,
  source,
  onExtracted,
  className,
  priority = 'Medium',
  suggestedTags = []
}: TaskExtractorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isCreated, setIsCreated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)

  const addTask = useMeetingStore(state => state.addTask)
  const toggleTaskStatus = useMeetingStore(state => state.toggleTaskStatus)

  // Check if the text is likely an action item
  const isActionItem = isLikelyActionItem(text)

  // Handle task creation
  const handleCreateTask = async () => {
    try {
      setIsCreating(true)
      setError(null)

      // Create default tags based on source
      const tags = [...suggestedTags]
      if (!tags.includes(source)) {
        tags.push(source)
      }

      // Create the task
      const newTaskId = addTask({
        title: text,
        priority,
        status: 'Todo',
        tags,
        createdFrom: source,
      })

      if (newTaskId) {
        setTaskId(newTaskId)
        setIsCreated(true)

        // Show success toast with encouraging message
        const successMessages = [
          'Nice! That action is on your list.',
          'Great job! Task added to your list.',
          'Task created successfully!',
          'Added to your tasks. Keep it up!',
          'Action captured! You\'re on top of things.'
        ];
        
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
        
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Task created',
            description: randomMessage,
            variant: 'success'
          }
        })
        window.dispatchEvent(event)

        // Show confetti animation
        const confettiEvent = new CustomEvent('confetti', {
          detail: { 
            intensity: 'medium',
            particleCount: 30,
            spread: 60,
            origin: { y: 0.7 }
          }
        })
        window.dispatchEvent(confettiEvent)

        // Call the onExtracted callback if provided
        if (onExtracted) {
          onExtracted()
        }
        
        // Add a small vibration feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(100);
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

  // Handle task status toggle
  const handleToggleStatus = () => {
    if (taskId) {
      toggleTaskStatus(taskId)
    }
  }

  // If not likely an action item, don't render anything
  if (!isActionItem) {
    return null
  }

  // Add a pulsing effect to draw attention to the button
  const [isPulsing, setIsPulsing] = useState(false);
  
  useEffect(() => {
    // Create a pulsing effect that happens every few seconds
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 gap-1.5 rounded-full transition-all duration-300",
            isPulsing && "scale-110 bg-primary/20",
            className
          )}
        >
          <Sparkles className={cn("h-3 w-3", isPulsing && "animate-ping")} />
          Make Task
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" sideOffset={5}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Create Task from Action Item
            </h4>
            <p className="text-xs text-muted-foreground">
              This looks like an action item. Create a task from this text:
            </p>
            <div className="bg-muted/70 p-3 rounded-md text-sm border border-muted">
              {text}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Priority: {priority}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-xs">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Source: {source}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isCreated ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div className="flex items-center bg-green-50 text-green-700 p-2 rounded-md border border-green-100">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium">Task created successfully!</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-green-200 hover:bg-green-50 hover:text-green-700 transition-all duration-300"
                  onClick={handleToggleStatus}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark as Complete
                </Button>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center bg-red-50 text-red-700 p-2 rounded-md border border-red-100"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-sm">{error}</span>
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleCreateTask}
                  disabled={isCreating}
                  className="w-full gap-1.5 bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:scale-[1.02]"
                  size="sm"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Create Task
                    </>
                  )}
                </Button>

                {suggestedTags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      Suggested Tags:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedTags.map(tag => (
                        <span
                          key={tag}
                          className="bg-muted/70 text-muted-foreground text-xs px-2 py-0.5 rounded-full border border-muted/80"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/20">
                        #{source}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  )
}