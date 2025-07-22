import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { CheckCircle, Circle, ArrowUpRight } from 'lucide-react'
import { useMeetingStore } from '@/store/meetingStore'
import { Task } from '@/types'

interface TaskListProps {
  limit?: number
  showCompleted?: boolean
  filter?: (task: Task) => boolean
  onViewAll?: () => void
}

export function TaskList({ 
  limit = 5, 
  showCompleted = false,
  filter,
  onViewAll
}: TaskListProps) {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const toggleTaskStatus = useMeetingStore(state => state.toggleTaskStatus)
  
  const tasks = currentMeeting?.tasks || []
  
  // Filter tasks
  let filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => task.status !== 'Done')
  
  // Apply custom filter if provided
  if (filter) {
    filteredTasks = filteredTasks.filter(filter)
  }
  
  // Sort by priority and then by creation date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    
    if (priorityDiff !== 0) return priorityDiff
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.created).getTime() - new Date(a.created).getTime()
  })
  
  // Apply limit
  const displayTasks = limit > 0 ? sortedTasks.slice(0, limit) : sortedTasks
  
  // Handle task status toggle
  const handleToggleStatus = (taskId: string) => {
    toggleTaskStatus(taskId)
  }
  
  return (
    <div className="space-y-2">
      {displayTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No tasks available</p>
      ) : (
        <>
          {displayTasks.map(task => (
            <Card key={task.id} className="p-3">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => handleToggleStatus(task.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.status === 'Done' ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === 'High' 
                          ? 'bg-red-500' 
                          : task.priority === 'Medium' 
                            ? 'bg-yellow-500' 
                            : 'bg-blue-500'
                      }`}
                    />
                    <p className={`text-sm font-medium ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                  </div>
                  
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {task.status === 'In Progress' && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                    In Progress
                  </span>
                )}
              </div>
            </Card>
          ))}
          
          {sortedTasks.length > limit && onViewAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs" 
              onClick={onViewAll}
            >
              View all {sortedTasks.length} tasks
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </>
      )}
    </div>
  )
}