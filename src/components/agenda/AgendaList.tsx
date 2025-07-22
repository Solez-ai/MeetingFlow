import { useState, useEffect, useRef } from 'react'
import { AgendaItem as AgendaItemType } from '@/types'
import { AgendaItemComponent } from './AgendaItem'
import { useMeetingStore } from '@/store/meetingStore'

interface AgendaListProps {
  items: AgendaItemType[]
  onReorder: (items: AgendaItemType[]) => void
}

export function AgendaList({ items, onReorder }: AgendaListProps) {
  const [orderedItems, setOrderedItems] = useState<AgendaItemType[]>(
    [...items].sort((a, b) => a.order - b.order)
  )
  
  const updateAgendaItem = useMeetingStore(state => state.updateAgendaItem)
  const removeAgendaItem = useMeetingStore(state => state.removeAgendaItem)
  
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  
  // Update local state when items prop changes
  useEffect(() => {
    setOrderedItems([...items].sort((a, b) => a.order - b.order))
  }, [items])
  
  const handleDragStart = (index: number) => {
    dragItem.current = index
  }
  
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }
  
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    
    const sourceIndex = dragItem.current
    const destinationIndex = dragOverItem.current
    
    if (sourceIndex === destinationIndex) return
    
    const newItems = [...orderedItems]
    const [removed] = newItems.splice(sourceIndex, 1)
    newItems.splice(destinationIndex, 0, removed)
    
    // Update order property
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))
    
    dragItem.current = null
    dragOverItem.current = null
    
    setOrderedItems(reorderedItems)
    onReorder(reorderedItems)
  }
  
  const handleUpdateItem = (id: string, updates: Partial<Omit<AgendaItemType, 'id'>>) => {
    updateAgendaItem(id, updates)
  }
  
  const handleRemoveItem = (id: string) => {
    removeAgendaItem(id)
  }
  
  return (
    <div className="space-y-2">
      {orderedItems.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <AgendaItemComponent
            item={item}
            onUpdate={(updates) => handleUpdateItem(item.id, updates)}
            onRemove={() => handleRemoveItem(item.id)}
          />
        </div>
      ))}
    </div>
  )
}