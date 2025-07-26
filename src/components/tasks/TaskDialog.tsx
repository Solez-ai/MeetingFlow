import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Task } from '@/types'
import { X, Plus, Calendar, AlertCircle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar as CalendarComponent } from '../ui/calendar'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onCreateTask: (task: Omit<Task, 'id' | 'created'>) => void
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void
}

export function TaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  onCreateTask, 
  onUpdateTask 
}: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [status, setStatus] = useState<'Todo' | 'In Progress' | 'Done'>('Todo')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [assignee, setAssignee] = useState('')
  const [errors, setErrors] = useState<{ title?: string }>({})
  
  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (open && task) {
      // Edit mode - populate form with task data
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setTags(task.tags)
      setAssignee(task.assignee || '')
      setErrors({})
    } else if (open) {
      // Create mode - reset form
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setStatus('Todo')
      setDueDate(undefined)
      setTags([])
      setAssignee('')
      setErrors({})
    }
  }, [open, task])
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: { title?: string } = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }
    
    const taskData = {
      title,
      description: description || undefined,
      priority,
      status,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      tags,
      assignee: assignee || undefined,
      createdFrom: 'manual' as const
    }
    
    if (task) {
      // Update existing task
      onUpdateTask(task.id, taskData)
    } else {
      // Create new task
      onCreateTask(taskData)
    }
  }
  
  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details below.' : 'Add a new task to your meeting.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className={errors.title ? "text-destructive" : ""}>
              Title {errors.title && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value.trim()) {
                  setErrors({ ...errors, title: undefined })
                }
              }}
              placeholder="What needs to be done?"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task (optional)"
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <Label>Priority</Label>
              <RadioGroup 
                value={priority} 
                onValueChange={(value: string) => setPriority(value as 'Low' | 'Medium' | 'High')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="High" id="priority-high" />
                  <Label htmlFor="priority-high" className="flex items-center cursor-pointer">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    High
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Medium" id="priority-medium" />
                  <Label htmlFor="priority-medium" className="flex items-center cursor-pointer">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Low" id="priority-low" />
                  <Label htmlFor="priority-low" className="flex items-center cursor-pointer">
                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                    Low
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label>Status</Label>
              <RadioGroup 
                value={status} 
                onValueChange={(value: string) => setStatus(value as 'Todo' | 'In Progress' | 'Done')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Todo" id="status-todo" />
                  <Label htmlFor="status-todo" className="cursor-pointer">To Do</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="In Progress" id="status-progress" />
                  <Label htmlFor="status-progress" className="cursor-pointer">In Progress</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Done" id="status-done" />
                  <Label htmlFor="status-done" className="cursor-pointer">Done</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dueDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setDueDate(undefined)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear due date</span>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Email or name (optional)"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag and press Enter"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add tag</span>
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <div 
                    key={tag} 
                    className="bg-muted flex items-center gap-1 px-2 py-1 rounded text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="gap-2 transition-transform hover:scale-103"
            >
              {task ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                  Update Task
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}