import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useMeetingStore } from '@/store/meetingStore'
import { extractTextFromHtml } from '@/utils/editorUtils'
import { extractTasksFromNotes } from '@/utils/taskExtractor'
import { TaskExtractor } from '../tasks/TaskExtractor'
import { TaskList } from '../tasks/TaskList'
import { Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function NotesTaskIntegration() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const [potentialTasks, setPotentialTasks] = useState<string[]>([])
  const [showTaskList, setShowTaskList] = useState(false)
  
  // Extract potential tasks from notes when they change
  useEffect(() => {
    if (!currentMeeting?.notes?.length) return
    
    // Extract text from all note blocks
    const notesText = currentMeeting.notes
      .map(note => extractTextFromHtml(note.content))
      .join('\n')
    
    // Extract potential tasks
    const tasks = extractTasksFromNotes(notesText)
    
    // Filter out tasks that are already in the task list
    const existingTaskTitles = new Set(currentMeeting.tasks.map(task => task.title.toLowerCase()))
    const newTasks = tasks.filter(task => !existingTaskTitles.has(task.toLowerCase()))
    
    setPotentialTasks(newTasks)
  }, [currentMeeting?.notes, currentMeeting?.tasks])
  
  // Filter tasks created from notes
  const notesTaskFilter = (task) => task.createdFrom === 'notes'
  
  if (!currentMeeting) {
    return null
  }
  
  const notesTasks = currentMeeting.tasks.filter(notesTaskFilter)
  
  return (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Notes & Tasks</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => setShowTaskList(!showTaskList)}
          >
            {showTaskList ? 'Hide Tasks' : 'Show Tasks'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {showTaskList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Tasks from Notes</h3>
                <span className="text-xs text-muted-foreground">{notesTasks.length} tasks</span>
              </div>
              
              <TaskList 
                filter={notesTaskFilter} 
                limit={5} 
                showCompleted={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {potentialTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Suggested Tasks</h3>
            </div>
            
            <div className="space-y-2">
              {potentialTasks.slice(0, 3).map((task, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                >
                  <p className="text-sm line-clamp-1 flex-1">{task}</p>
                  <TaskExtractor 
                    text={task} 
                    source="notes" 
                    suggestedTags={['auto-detected']}
                    onExtracted={() => {
                      setPotentialTasks(prev => prev.filter((_, i) => i !== index))
                    }}
                  />
                </div>
              ))}
              
              {potentialTasks.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs gap-1"
                  onClick={() => setShowTaskList(true)}
                >
                  {potentialTasks.length - 3} more suggestions
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}