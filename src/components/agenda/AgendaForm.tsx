import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AgendaFormProps {
  onAddItem: (title: string, duration: number, description?: string) => void
}

export function AgendaForm({ onAddItem }: AgendaFormProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(5) // Default to 5 minutes
  const [description, setDescription] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return
    
    onAddItem(title.trim(), duration, description.trim() || undefined)
    
    // Reset form
    setTitle('')
    setDuration(5)
    setDescription('')
    setIsExpanded(false)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add agenda topic..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
          onFocus={() => setIsExpanded(true)}
        />
        <Button type="submit" disabled={!title.trim()}>
          Add
        </Button>
      </div>
      
      {isExpanded && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              min={1}
              max={120}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
              className="w-full"
              placeholder="Duration (minutes)"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Duration in minutes
            </div>
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}
    </form>
  )
}