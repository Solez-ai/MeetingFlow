import { useState, useEffect } from 'react'
import { AgendaItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface AgendaItemProps {
  item: AgendaItem
  onUpdate: (updates: Partial<Omit<AgendaItem, 'id'>>) => void
  onRemove: () => void
}

export function AgendaItemComponent({ item, onUpdate, onRemove }: AgendaItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [duration, setDuration] = useState(item.duration)
  const [description, setDescription] = useState(item.description || '')
  
  // Update local state when item prop changes
  useEffect(() => {
    setTitle(item.title)
    setDuration(item.duration)
    setDescription(item.description || '')
  }, [item])
  
  const handleSave = () => {
    if (!title.trim()) return
    
    onUpdate({
      title: title.trim(),
      duration,
      description: description.trim() || undefined
    })
    
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setTitle(item.title)
    setDuration(item.duration)
    setDescription(item.description || '')
    setIsEditing(false)
  }
  
  return (
    <div className="border rounded-md p-3 bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          <div className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>
          
          {!isEditing ? (
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{item.duration} min</span>
                {item.description && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{item.description}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Topic title"
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                  className="w-24"
                  placeholder="Minutes"
                  onClick={(e) => e.stopPropagation()}
                />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="flex-1 h-20"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-1">
          {!isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}>
                Remove
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation()
                handleCancel()
              }}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={(e) => {
                e.stopPropagation()
                handleSave()
              }} disabled={!title.trim()}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
  )
}