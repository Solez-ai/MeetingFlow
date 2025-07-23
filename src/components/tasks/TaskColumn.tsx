import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TaskCard } from './TaskCard'
import { Task } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  
  // Handle drag leave
  const handleDragLeave = () => {
    setIsDragOver(false)
  }
  
  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    onStatusChange(taskId, status)
    setIsDragOver(false)
  }
  
  // Get column style based on status
  const getColumnStyle = () => {
    switch (status) {
      case 'Todo':
        return {
          headerClass: 'bg-slate-50 border-b',
          countClass: 'bg-slate-100 text-slate-700'
        }
      case 'In Progress':
        return {
          headerClass: 'bg-blue-50 border-b',
          countClass: 'bg-blue-100 text-blue-700'
        }
      case 'Done':
        return {
          headerClass: 'bg-green-50 border-b',
          countClass: 'bg-green-100 text-green-700'
        }
      default:
        return {
          headerClass: 'bg-slate-50 border-b',
          countClass: 'bg-slate-100 text-slate-700'
        }
    }
  }
  
  const columnStyle = getColumnStyle()
  
  return (
    <Card 
      className={cn(
        "flex flex-col h-full transition-all duration-200 shadow-sm",
        isDragOver ? "ring-2 ring-primary shadow-md" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className={cn("py-3 px-3", columnStyle.headerClass)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", columnStyle.countClass)}>
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 border border-dashed rounded-md bg-muted/30">
            <p className="text-sm text-muted-foreground">Drop tasks here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <TaskCard 
                  task={task} 
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}