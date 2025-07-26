import { useMeetingStore } from '@/store/meetingStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMobileDetection } from '@/hooks/useMobileDetection'

export function AgendaSidebar() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const { isMobile } = useMobileDetection()
  
  // Calculate total agenda time
  const totalTime = currentMeeting?.agenda.reduce((total, item) => total + item.duration, 0) || 0
  
  // Sort agenda items by order
  const sortedAgenda = currentMeeting?.agenda
    ? [...currentMeeting.agenda].sort((a, b) => a.order - b.order)
    : []
  
  return (
    <Card className="h-full">
      <CardHeader className={`${isMobile ? 'pb-2 px-3 py-3' : 'pb-2'}`}>
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} flex justify-between items-center`}>
          <span>Meeting Agenda</span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-normal text-muted-foreground`}>
            {totalTime} min
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className={`pt-0 ${isMobile ? 'px-3 pb-3' : ''}`}>
        {sortedAgenda.length > 0 ? (
          <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            {sortedAgenda.map((item) => (
              <div key={item.id} className={`border-l-2 pl-2 sm:pl-3 py-1 touch-manipulation`}>
                <div className="flex justify-between items-start gap-2">
                  <div className={`font-medium ${isMobile ? 'text-sm' : ''} flex-1 min-w-0`}>
                    <span className="line-clamp-2">{item.title}</span>
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground flex-shrink-0`}>
                    {item.duration} min
                  </div>
                </div>
                {item.description && (
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 line-clamp-2`}>
                    {item.description}
                  </div>
                )}
              </div>
            ))}
            
            {/* Add 5-minute wrap-up automatically */}
            <div className={`border-l-2 border-dashed pl-2 sm:pl-3 py-1`}>
              <div className="flex justify-between items-start gap-2">
                <div className={`font-medium ${isMobile ? 'text-sm' : ''} flex-1`}>Wrap-up</div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground flex-shrink-0`}>
                  5 min
                </div>
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                Summary and next steps
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} text-muted-foreground`}>
            <p className={isMobile ? 'text-sm' : ''}>No agenda items yet</p>
            <Button 
              variant="link" 
              className={`mt-2 ${isMobile ? 'text-sm' : ''} touch-manipulation`}
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