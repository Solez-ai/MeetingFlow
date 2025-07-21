import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to MeetingFlow</h1>
          <p className="text-muted-foreground mt-1">
            Your privacy-first meeting productivity tool
          </p>
        </div>
        <Button size="lg" className="w-full md:w-auto">
          Start New Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Meetings</CardTitle>
            <CardDescription>Access your recent meeting sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">No recent meetings found</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Meetings</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">No pending tasks</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Tasks</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Create New Agenda
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Start Transcription
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Open Notes Editor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}