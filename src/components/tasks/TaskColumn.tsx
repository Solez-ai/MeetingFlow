import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TaskCard } from './TaskCard'
import { Task } from '@/types'

interface TaskColumnProps {
  title: string
  tasks: Task[]
  status: 'Todo' | 'In Progress' | 'Done'
  onStatusChange: (taskId: string, newStatus: 'Todo' | 'In Progress' | 'Done') => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskColumn({ 
  title, 
  tasks, 
  status,
  onStatusChange,
  onEditTask,
  onDeleteTask
}: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  
  // Handle drag leave
  const handleDragLeave = () => {
    setIsDragOver(false)
  }
  
  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    onStatusChange(taskId, status)
    setIsDragOver(false)
  }
  
  return (
    <Card 
      className={`flex flex-col h-full ${isDragOver ? 'ring-2 ring-primary' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDragStart={(e) => handleDragStart(e, task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}