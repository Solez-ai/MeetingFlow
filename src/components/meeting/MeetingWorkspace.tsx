import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function MeetingWorkspace() {
  const { id } = useParams()
  
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {id ? `Meeting ${id}` : 'New Meeting'}
        </h1>
        <p className="text-muted-foreground">
          Meeting workspace will be implemented in future tasks
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Agenda Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Agenda management coming soon...</p>
          </CardContent>
        </Card>
        
        {/* Notes Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Rich text editor coming soon...</p>
          </CardContent>
        </Card>
        
        {/* Tasks Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Task management coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}