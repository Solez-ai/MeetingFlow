import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { useMeetingStore } from '@/store/meetingStore'
import { TaskColumn } from './TaskColumn'
import { TaskDialog } from './TaskDialog'
import { Task } from '@/types'

export function TaskManager() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const tasks = currentMeeting?.tasks || []
  const addTask = useMeetingStore(state => state.addTask)
  const updateTask = useMeetingStore(state => state.updateTask)
  const removeTask = useMeetingStore(state => state.removeTask)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('created')
  
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
  
  // Extract all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)))
  
  // Handle creating a new task
  const handleCreateTask = (task: Omit<Task, 'id' | 'created'>) => {
    addTask(task)
    setIsDialogOpen(false)
  }
  
  // Handle updating an existing task
  const handleUpdateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    updateTask(id, updates)
    setEditingTask(null)
    setIsDialogOpen(false)
  }
  
  // Handle task status change via drag and drop
  const handleStatusChange = (taskId: string, newStatus: 'Todo' | 'In Progress' | 'Done') => {
    updateTask(taskId, { status: newStatus })
  }
  
  // Open dialog to edit a task
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }
  
  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    removeTask(taskId)
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
            {tasks.length}
          </span>
        </div>
        <Button size="sm" onClick={() => {
          setEditingTask(null)
          setIsDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>
      
      {/* Filtering and sorting controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select 
          className="text-xs border rounded px-2 py-1"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'priority' | 'dueDate' | 'created')}
        >
          <option value="created">Sort: Date Created</option>
          <option value="priority">Sort: Priority</option>
          <option value="dueDate">Sort: Due Date</option>
        </select>
        
        <select 
          className="text-xs border rounded px-2 py-1"
          value={filterTag || ''}
          onChange={(e) => setFilterTag(e.target.value || null)}
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      
      {/* Kanban board layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
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