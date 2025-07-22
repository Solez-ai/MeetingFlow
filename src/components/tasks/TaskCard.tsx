import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Edit, Trash2, Calendar, Tag } from 'lucide-react'
import { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent) => void
  onEdit: () => void
  onDelete: () => void
}

export function TaskCard({ task, onDragStart, onEdit, onDelete }: TaskCardProps) {
  // Format due date if present
  const formattedDueDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    : null
  
  // Determine priority color
  const priorityColor = {
    'High': 'bg-red-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-blue-500'
  }[task.priority]
  
  return (
    <Card 
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      draggable
      onDragStart={onDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
              <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {formattedDueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formattedDueDate}</span>
                </div>
              )}
              
              {task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {task.tags.slice(0, 2).map(tag => (
                    <span 
                      key={tag} 
                      className="bg-muted px-1.5 py-0.5 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
              
              {task.createdFrom && task.createdFrom !== 'manual' && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {task.createdFrom === 'transcript' ? 'From transcript' : 'From notes'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="h-3 w-3" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-destructive hover:text-destructive" 
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}