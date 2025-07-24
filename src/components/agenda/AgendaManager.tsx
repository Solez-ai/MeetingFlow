import { useState } from 'react'
import { useMeetingStore } from '@/store/meetingStore'
import { AgendaForm } from './AgendaForm'
import { AgendaList } from './AgendaList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgendaItem } from '@/types'

export function AgendaManager() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const addAgendaItem = useMeetingStore(state => state.addAgendaItem)
  const generateTimeBalancedAgenda = useMeetingStore(state => state.generateTimeBalancedAgenda)
  const reorderAgendaItems = useMeetingStore(state => state.reorderAgendaItems)
  
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Generate a time-balanced agenda
  const handleGenerateAgenda = () => {
    if (!currentMeeting) return
    
    setIsGenerating(true)
    
    // Get the meeting duration from metadata or default to 60 minutes
    const totalDuration = currentMeeting.metadata.duration || 60
    
    // Generate the time-balanced agenda
    generateTimeBalancedAgenda(totalDuration)
    
    setIsGenerating(false)
  }
  
  // Handle adding a new agenda item
  const handleAddAgendaItem = (title: string, duration: number, description?: string) => {
    addAgendaItem({
      title,
      duration,
      description
    })
  }
  
  // Handle reordering agenda items via drag and drop
  const handleReorderItems = (items: AgendaItem[]) => {
    const itemIds = items.map(item => item.id)
    reorderAgendaItems(itemIds)
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Agenda</span>
          <Button 
            size="sm" 
            onClick={handleGenerateAgenda}
            disabled={!currentMeeting || currentMeeting.agenda.length === 0 || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Balance Time'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto flex flex-col">
        <AgendaForm onAddItem={handleAddAgendaItem} />
        
        <div className="mt-4 flex-1 overflow-auto">
          {currentMeeting && (
            <AgendaList 
              items={currentMeeting.agenda} 
              onReorder={handleReorderItems} 
            />
          )}
          
          {(!currentMeeting || currentMeeting.agenda.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No agenda items yet. Add topics above to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}