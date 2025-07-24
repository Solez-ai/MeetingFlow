import { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Calendar, Clock, CheckCircle, Filter, ArrowDownAZ, Mail, Send } from 'lucide-react'
import { useMeetingStore } from '@/store/meetingStore'
import { TaskColumn } from './TaskColumn'
import { TaskDialog } from './TaskDialog'
import { Task } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { useEmailNotifications } from '@/hooks/useEmailNotifications'

// Import the MeetingState type from the store
import type { MeetingState } from '@/store/meetingStore'

interface TaskCardProps {
  task: Task;
  onStatusToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSendReminder?: () => void;
  needsReminder?: boolean;
  sendingReminder?: boolean;
}

export function TaskManager() {
  const currentMeeting = useMeetingStore((state: MeetingState) => state.currentMeeting)
  const tasks = currentMeeting?.tasks || []
  const addTask = useMeetingStore((state: MeetingState) => state.addTask)
  const updateTask = useMeetingStore((state: MeetingState) => state.updateTask)
  const removeTask = useMeetingStore((state: MeetingState) => state.removeTask)

  // Email notifications hook
  const {
    settings: emailSettings,
    isConfigured: isEmailConfigured,
    sendTaskReminder,
    sendTaskAssignment,
    sendTaskCompletion,
    checkReminders,
    getTasksNeedingReminders,
    cleanupReminderData
  } = useEmailNotifications()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('created')
  const [view, setView] = useState<'kanban' | 'today' | 'upcoming' | 'all'>('kanban')
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  // Check for reminders periodically
  useEffect(() => {
    if (isEmailConfigured && emailSettings.enabled && emailSettings.remindersEnabled) {
      checkReminders(tasks)
      
      // Set up periodic reminder checking (every hour)
      const interval = setInterval(() => {
        checkReminders(tasks)
      }, 60 * 60 * 1000) // 1 hour
      
      return () => clearInterval(interval)
    }
  }, [tasks, isEmailConfigured, emailSettings.enabled, emailSettings.remindersEnabled, checkReminders])

  // Clean up reminder tracking data when tasks change
  useEffect(() => {
    const taskIds = tasks.map(t => t.id)
    cleanupReminderData(taskIds)
  }, [tasks, cleanupReminderData])

  // Get tasks that need reminders for UI indication
  const tasksNeedingReminders = getTasksNeedingReminders(tasks)

  // Handle manual reminder sending
  const handleSendReminder = async (task: Task) => {
    if (!task.assignee && !emailSettings.userEmail) {
      const event = new CustomEvent('toast', {
        detail: {
          title: 'No email address',
          description: 'Task has no assignee and no default email is configured.',
          variant: 'destructive'
        }
      })
      window.dispatchEvent(event)
      return
    }

    setSendingReminder(task.id)
    
    try {
      const success = await sendTaskReminder(task, task.assignee || emailSettings.userEmail)
      
      const event = new CustomEvent('toast', {
        detail: {
          title: success ? 'Reminder sent' : 'Failed to send reminder',
          description: success 
            ? `Reminder sent for "${task.title}"` 
            : 'Failed to send reminder. Please check your email configuration.',
          variant: success ? 'success' : 'destructive'
        }
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error('Error sending reminder:', error)
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Error sending reminder',
          description: 'An error occurred while sending the reminder.',
          variant: 'destructive'
        }
      })
      window.dispatchEvent(event)
    } finally {
      setSendingReminder(null)
    }
  }

  // Group tasks by status
  const todoTasks = tasks.filter(task => task.status === 'Todo')
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress')
  const doneTasks = tasks.filter(task => task.status === 'Done')

  // Filter tasks by tag if filter is active
  const filteredTodoTasks = filterTag
    ? todoTasks.filter(task => task.tags.includes(filterTag))
    : todoTasks

  const filteredInProgressTasks = filterTag
    ? inProgressTasks.filter(task => task.tags.includes(filterTag))
    : inProgressTasks

  const filteredDoneTasks = filterTag
    ? doneTasks.filter(task => task.tags.includes(filterTag))
    : doneTasks

  // Sort tasks based on sortBy
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else {
        // Default sort by created date (newest first)
        return new Date(b.created).getTime() - new Date(a.created).getTime()
      }
    })
  }

  const sortedTodoTasks = sortTasks(filteredTodoTasks)
  const sortedInProgressTasks = sortTasks(filteredInProgressTasks)
  const sortedDoneTasks = sortTasks(filteredDoneTasks)

  // Get today's tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  })

  // Get upcoming tasks (next 7 days)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate > today && dueDate <= nextWeek
  })

  // Extract all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)))

  // Handle creating a new task
  const handleCreateTask = async (task: Omit<Task, 'id' | 'created'>) => {
    const taskId = addTask(task)
    setIsDialogOpen(false)

    // Send assignment notification if task has an assignee and email notifications are enabled
    if (task.assignee && isEmailConfigured && emailSettings.enabled) {
      try {
        await sendTaskAssignment(
          { ...task, id: taskId, created: new Date().toISOString() } as Task,
          task.assignee,
          emailSettings.userEmail || 'MeetingFlow User'
        )
      } catch (error) {
        console.error('Failed to send task assignment email:', error)
      }
    }

    // Show success toast
    const event = new CustomEvent('toast', {
      detail: {
        title: 'Task created',
        description: task.assignee && isEmailConfigured && emailSettings.enabled
          ? 'Task created and assignment notification sent.'
          : 'Your task has been created successfully.',
        variant: 'success'
      }
    })
    window.dispatchEvent(event)
  }

  // Handle updating an existing task
  const handleUpdateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    const originalTask = tasks.find(t => t.id === id)
    updateTask(id, updates)
    setEditingTask(null)
    setIsDialogOpen(false)

    // Send assignment notification if assignee changed and email notifications are enabled
    if (originalTask && updates.assignee && updates.assignee !== originalTask.assignee && 
        isEmailConfigured && emailSettings.enabled) {
      try {
        const updatedTask = { ...originalTask, ...updates } as Task
        await sendTaskAssignment(
          updatedTask,
          updates.assignee,
          emailSettings.userEmail || 'MeetingFlow User'
        )
      } catch (error) {
        console.error('Failed to send task assignment email:', error)
      }
    }

    // Show success toast
    const event = new CustomEvent('toast', {
      detail: {
        title: 'Task updated',
        description: updates.assignee && updates.assignee !== originalTask?.assignee && 
                    isEmailConfigured && emailSettings.enabled
          ? 'Task updated and assignment notification sent.'
          : 'Your task has been updated successfully.',
        variant: 'success'
      }
    })
    window.dispatchEvent(event)
  }

  // Handle task status change via drag and drop
  const handleStatusChange = async (taskId: string, newStatus: 'Todo' | 'In Progress' | 'Done') => {
    const task = tasks.find(t => t.id === taskId)
    updateTask(taskId, { status: newStatus })

    // If task is marked as done, show confetti and send completion notification
    if (newStatus === 'Done') {
      const event = new CustomEvent('confetti')
      window.dispatchEvent(event)

      // Send completion notification if email notifications are enabled
      if (task && isEmailConfigured && emailSettings.enabled && emailSettings.userEmail) {
        try {
          const recipients = [emailSettings.userEmail]
          if (task.assignee && task.assignee !== emailSettings.userEmail) {
            recipients.push(task.assignee)
          }
          
          await sendTaskCompletion(
            { ...task, status: newStatus },
            recipients,
            emailSettings.userEmail
          )
        } catch (error) {
          console.error('Failed to send task completion email:', error)
        }
      }
    }
  }

  // Open dialog to edit a task
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    removeTask(taskId)

    // Show success toast
    const event = new CustomEvent('toast', {
      detail: {
        title: 'Task deleted',
        description: 'Your task has been deleted.',
        variant: 'default'
      }
    })
    window.dispatchEvent(event)
  }

  // Group tasks by due date for list view
  const groupTasksByDueDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] & { displayName?: string } } = {}

    tasks.forEach((task: Task) => {
      if (!task.dueDate) {
        const key = 'No Due Date'
        if (!groups[key]) groups[key] = [] as Task[] & { displayName?: string }
        groups[key].push(task)
      } else {
        const date = new Date(task.dueDate)
        const key = format(date, 'yyyy-MM-dd')
        if (!groups[key]) {
          groups[key] = [] as Task[] & { displayName?: string }
          groups[key].displayName = format(date, 'EEEE, MMMM d')
        }
        groups[key].push(task)
      }
    })

    return groups
  }

  // Render task list for non-kanban views
  const renderTaskList = (tasksToRender: Task[]) => {
    const sortedTasks = sortTasks(tasksToRender)
    const groups = groupTasksByDueDate(sortedTasks)

    return (
      <div className="space-y-6 overflow-y-auto p-1">
        {Object.keys(groups).map((key: string) => (
          <div key={key} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {groups[key]?.displayName || key}
            </h3>
            <div className="space-y-2">
              {groups[key]?.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusToggle={() => {
                    const nextStatus = task.status === 'Todo'
                      ? 'In Progress'
                      : task.status === 'In Progress'
                        ? 'Done'
                        : 'Todo'
                    handleStatusChange(task.id, nextStatus)
                  }}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onSendReminder={() => handleSendReminder(task)}
                  needsReminder={tasksNeedingReminders.some(t => t.id === task.id)}
                  sendingReminder={sendingReminder === task.id}
                />
              ))}
            </div>
          </div>
        ))}

        {tasksToRender.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="bg-muted rounded-full p-3 mb-3">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              {view === 'today'
                ? "You don't have any tasks due today."
                : view === 'upcoming'
                  ? "You don't have any upcoming tasks."
                  : "No tasks match your current filters."}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Simple task card for list views
  function TaskCard({ task, onStatusToggle, onEdit, onDelete, onSendReminder, needsReminder, sendingReminder }: TaskCardProps) {
    const dueDate = task.dueDate
      ? format(new Date(task.dueDate), 'MMM d')
      : null

    const priorityColor = {
      'High': 'bg-red-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-blue-500'
    }[task.priority]

    const statusColor = {
      'Todo': 'border-gray-200',
      'In Progress': 'border-blue-500 bg-blue-50',
      'Done': 'border-green-500 bg-green-50'
    }[task.status]

    // Check if task is overdue
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

    return (
      <Card className={cn(
        "border-l-4", 
        statusColor,
        needsReminder && "ring-2 ring-orange-200 ring-offset-1"
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onStatusToggle}
              className="flex-shrink-0"
              type="button"
            >
              {task.status === 'Done' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className={cn(
                  "h-5 w-5 rounded-full border-2",
                  task.status === 'In Progress' ? "border-blue-500" : "border-gray-300"
                )} />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", priorityColor)} />
                <h3 className={cn(
                  "font-medium text-sm",
                  task.status === 'Done' && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                {needsReminder && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    {isOverdue ? 'Overdue' : 'Due Soon'}
                  </Badge>
                )}
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.tags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {task.tags[0]}
                  {task.tags.length > 1 && ` +${task.tags.length - 1}`}
                </Badge>
              )}

              {dueDate && (
                <span className={cn(
                  "text-xs",
                  isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                )}>
                  {dueDate}
                </span>
              )}

              {task.assignee && (
                <div className="bg-primary/10 text-primary rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                  {task.assignee.substring(0, 1).toUpperCase()}
                </div>
              )}

              <div className="flex gap-1">
                {/* Reminder button */}
                {onSendReminder && isEmailConfigured && emailSettings.enabled && (task.assignee || emailSettings.userEmail) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onSendReminder}
                    disabled={sendingReminder}
                    title="Send reminder email"
                  >
                    <span className="sr-only">Send reminder</span>
                    {sendingReminder ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onEdit}
                >
                  <span className="sr-only">Edit</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
                    <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <span className="sr-only">Delete</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
                    <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM5 6H10V12H5V6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <Badge variant="secondary" className="rounded-full">
            {tasks.length}
          </Badge>
          {tasksNeedingReminders.length > 0 && (
            <Badge variant="outline" className="rounded-full bg-orange-50 text-orange-700 border-orange-200">
              <Mail className="h-3 w-3 mr-1" />
              {tasksNeedingReminders.length} need{tasksNeedingReminders.length === 1 ? 's' : ''} reminder
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {isEmailConfigured && emailSettings.enabled && tasksNeedingReminders.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                // Send reminders for all tasks that need them
                for (const task of tasksNeedingReminders) {
                  if (task.assignee || emailSettings.userEmail) {
                    await handleSendReminder(task)
                  }
                }
              }}
              className="gap-1.5"
              disabled={sendingReminder !== null}
            >
              <Send className="h-4 w-4" />
              Send All Reminders
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null)
              setIsDialogOpen(true)
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* View selector */}
      <Tabs
        value={view}
        onValueChange={(v: string) => setView(v as 'kanban' | 'today' | 'upcoming' | 'all')}
        className="mb-4"
      >
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="kanban" className="text-xs">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5">
              <path d="M14 2.5C14 1.67157 13.3284 1 12.5 1H2.5C1.67157 1 1 1.67157 1 2.5V12.5C1 13.3284 1.67157 14 2.5 14H12.5C13.3284 14 14 13.3284 14 12.5V2.5ZM2.5 2H6V13H2.5C2.22386 13 2 12.7761 2 12.5V2.5C2 2.22386 2.22386 2 2.5 2ZM7 2H12.5C12.7761 2 13 2.22386 13 2.5V6H7V2ZM13 7V12.5C13 12.7761 12.7761 13 12.5 13H7V7H13Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
            Kanban
          </TabsTrigger>
          <TabsTrigger value="today" className="text-xs">
            <Calendar className="h-4 w-4 mr-1.5" />
            Today
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs">
            <Clock className="h-4 w-4 mr-1.5" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            <CheckCircle className="h-4 w-4 mr-1.5" />
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filtering and sorting controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <ArrowDownAZ className="h-3.5 w-3.5" />
              {sortBy === 'created' ? 'Date Created' :
                sortBy === 'priority' ? 'Priority' : 'Due Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="start">
            <div className="flex flex-col">
              <Button
                variant={sortBy === 'created' ? 'default' : 'ghost'}
                size="sm"
                className="justify-start rounded-none"
                onClick={() => setSortBy('created')}
              >
                Date Created
              </Button>
              <Button
                variant={sortBy === 'priority' ? 'default' : 'ghost'}
                size="sm"
                className="justify-start rounded-none"
                onClick={() => setSortBy('priority')}
              >
                Priority
              </Button>
              <Button
                variant={sortBy === 'dueDate' ? 'default' : 'ghost'}
                size="sm"
                className="justify-start rounded-none"
                onClick={() => setSortBy('dueDate')}
              >
                Due Date
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                filterTag && "bg-primary/10 text-primary border-primary/20"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              {filterTag || 'All Tags'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="start">
            <div className="flex flex-col">
              <Button
                variant={!filterTag ? 'default' : 'ghost'}
                size="sm"
                className="justify-start rounded-none"
                onClick={() => setFilterTag(null)}
              >
                All Tags
              </Button>
              {allTags.map((tag: string) => (
                <Button
                  key={tag}
                  variant={filterTag === tag ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start rounded-none"
                  onClick={() => setFilterTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Task views */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' && (
          <div className="h-full m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              <TaskColumn
                title="To Do"
                tasks={sortedTodoTasks}
                status="Todo"
                onStatusChange={handleStatusChange}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />

              <TaskColumn
                title="In Progress"
                tasks={sortedInProgressTasks}
                status="In Progress"
                onStatusChange={handleStatusChange}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />

              <TaskColumn
                title="Done"
                tasks={sortedDoneTasks}
                status="Done"
                onStatusChange={handleStatusChange}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </div>
        )}

        {view === 'today' && (
          <div className="h-full m-0 overflow-y-auto">
            {renderTaskList(todayTasks)}
          </div>
        )}

        {view === 'upcoming' && (
          <div className="h-full m-0 overflow-y-auto">
            {renderTaskList(upcomingTasks)}
          </div>
        )}

        {view === 'all' && (
          <div className="h-full m-0 overflow-y-auto">
            {renderTaskList(tasks)}
          </div>
        )}
      </div>

      {/* Task creation/editing dialog */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  )
}