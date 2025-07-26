import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Edit, Trash2, Calendar, User, Clock } from 'lucide-react'
import { Task } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '../ui/badge'


interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
  onEdit: () => void
  onDelete: () => void
}

export function TaskCard({ task, onDragStart, onEdit, onDelete }: TaskCardProps) {
  // Format due date if present
  const formattedDueDate = task.dueDate 
    ? format(new Date(task.dueDate), 'MMM d')
    : null
  
  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'
  
  // Format created date
  const createdDate = format(new Date(task.created), 'MMM d')
  
  // Determine priority color and label
  const priorityConfig = {
    'High': { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', label: 'High' },
    'Medium': { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Medium' },
    'Low': { color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Low' }
  }[task.priority]
  
  return (
    <Card 
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200",
        "hover:shadow-md border-l-4",
        task.status === 'Done' ? "border-l-green-500" : 
        task.status === 'In Progress' ? "border-l-blue-500" : 
        isOverdue ? "border-l-red-500" : "border-l-slate-200"
      )}
      draggable
      onDragStart={onDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn("w-2 h-2 rounded-full", priorityConfig.color)} />
              <h3 className={cn(
                "font-medium text-sm line-clamp-2",
                task.status === 'Done' && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {formattedDueDate && (
                <div className={cn(
                  "flex items-center text-xs rounded-full px-2 py-0.5",
                  isOverdue ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formattedDueDate}</span>
                </div>
              )}
              
              {task.assignee && (
                <div className="flex items-center text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  <User className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[80px]">{task.assignee}</span>
                </div>
              )}
              
              <div className="flex items-center text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                <Clock className="h-3 w-3 mr-1" />
                <span>{createdDate}</span>
              </div>
            </div>
            
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.slice(0, 3).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="text-xs py-0 px-1.5 h-5"
                  >
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {task.createdFrom && task.createdFrom !== 'manual' && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {task.createdFrom === 'transcript' ? 'From transcript' : 'From notes'}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex gap-1 ml-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full opacity-50 hover:opacity-100" 
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
              className="h-6 w-6 rounded-full text-destructive opacity-50 hover:opacity-100 hover:text-destructive" 
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