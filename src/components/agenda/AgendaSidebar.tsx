import { useMeetingStore } from '@/store/meetingStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function AgendaSidebar() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  
  // Calculate total agenda time
  const totalTime = currentMeeting?.agenda.reduce((total, item) => total + item.duration, 0) || 0
  
  // Sort agenda items by order
  const sortedAgenda = currentMeeting?.agenda
    ? [...currentMeeting.agenda].sort((a, b) => a.order - b.order)
    : []
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Meeting Agenda</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalTime} min
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {sortedAgenda.length > 0 ? (
          <div className="space-y-3">
            {sortedAgenda.map((item, index) => (
              <div key={item.id} className="border-l-2 pl-3 py-1">
                <div className="flex justify-between">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.duration} min</div>
                </div>
                {item.description && (
                  <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                )}
              </div>
            ))}
            
            {/* Add 5-minute wrap-up automatically */}
            <div className="border-l-2 border-dashed pl-3 py-1">
              <div className="flex justify-between">
                <div className="font-medium">Wrap-up</div>
                <div className="text-sm text-muted-foreground">5 min</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Summary and next steps
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No agenda items yet</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => {
                // Scroll to agenda panel
                document.querySelector('.agenda-panel')?.scrollIntoView({ 
                  behavior: 'smooth' 
                })
              }}
            >
              Add topics to get started
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}