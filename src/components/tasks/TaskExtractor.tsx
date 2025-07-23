import { useState } from 'react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react'
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

        // Show success toast
        const event = new CustomEvent('toast', {
          detail: {
            title: 'Task created',
            description: 'Nice! That action is on your list.',
            variant: 'success'
          }
        })
        window.dispatchEvent(event)

        // Show mini confetti
        const confettiEvent = new CustomEvent('confetti', {
          detail: { intensity: 'low' }
        })
        window.dispatchEvent(confettiEvent)

        // Call the onExtracted callback if provided
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 gap-1.5 rounded-full",
            className
          )}
        >
          <Sparkles className="h-3 w-3" />
          Make Task
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" sideOffset={5}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Create Task</h4>
            <p className="text-xs text-muted-foreground">
              This looks like an action item. Create a task from this text:
            </p>
            <div className="bg-muted p-2 rounded text-xs">
              {text}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isCreated ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-2"
              >
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Task created successfully!</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
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
                className="flex items-center text-red-600 text-sm"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{error}</span>
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <Button
                  onClick={handleCreateTask}
                  disabled={isCreating}
                  className="w-full gap-1.5"
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
                    <p className="text-xs text-muted-foreground mb-1">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestedTags.map(tag => (
                        <span
                          key={tag}
                          className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded">
                        {source}
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