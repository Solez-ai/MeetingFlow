import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { PlusIcon, ClockIcon, CheckSquareIcon, MicIcon, FileTextIcon, SettingsIcon } from 'lucide-react'

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
        <Link to="/meeting/new">
          <Button size="lg" className="w-full md:w-auto gap-2">
            <PlusIcon className="h-5 w-5" />
            Start New Meeting
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              Recent Meetings
            </CardTitle>
            <CardDescription>Access your recent meeting sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">No recent meetings found</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Meetings</Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquareIcon className="h-5 w-5 text-primary" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">No pending tasks</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Tasks</Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common actions to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/meeting/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileTextIcon className="h-4 w-4" />
                Create New Agenda
              </Button>
            </Link>
            <Link to="/meeting/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <MicIcon className="h-4 w-4" />
                Start Transcription
              </Button>
            </Link>
            <Link to="/meeting/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileTextIcon className="h-4 w-4" />
                Open Notes Editor
              </Button>
            </Link>
          </CardContent>
          <CardFooter>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="w-full gap-2">
                <SettingsIcon className="h-4 w-4" />
                Configure Settings
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Additional Info Section */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
        <p className="text-muted-foreground mb-4">
          MeetingFlow helps you manage your entire meeting workflow. Start by creating a new meeting 
          to access agenda planning, note-taking, task management, and transcription features.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Privacy-First
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            No Backend Required
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Real-time Collaboration
          </span>
        </div>
      </div>
    </div>
  )
}