import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { MeetingList } from './meeting/MeetingList'
import { MeetingCreateForm } from './meeting/MeetingCreateForm'
import { useMeetingStore } from '@/store/meetingStore'
import { 
  PlusIcon, 
  ClockIcon, 
  CheckSquareIcon, 
  MicIcon, 
  FileTextIcon, 
  SettingsIcon,
  TrendingUpIcon,
  CalendarIcon,
  UsersIcon,
  BarChart3Icon,
  ArrowRightIcon,
  SparklesIcon,
  LightbulbIcon
} from 'lucide-react'

export function Dashboard() {
  const { meetings, currentMeeting } = useMeetingStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [animateIn, setAnimateIn] = useState(false)
  
  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => setAnimateIn(true), 100)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  // Calculate dashboard stats
  const totalMeetings = meetings.length

  // Calculate total tasks across all meetings
  const totalTasks = meetings.reduce((acc, meeting) => {
    const fullMeeting = useMeetingStore.getState().loadMeeting(meeting.id)
    return acc + (fullMeeting?.tasks.length || 0)
  }, 0)

  const pendingTasks = meetings.reduce((acc, meeting) => {
    const fullMeeting = useMeetingStore.getState().loadMeeting(meeting.id)
    const pending = fullMeeting?.tasks.filter(task => task.status !== 'Done').length || 0
    return acc + pending
  }, 0)

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <MeetingCreateForm 
          onCancel={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <div className="h-10 bg-muted rounded-md w-3/4 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/2"></div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-muted rounded-md w-20 mb-2"></div>
                    <div className="h-8 bg-muted rounded-md w-12"></div>
                  </div>
                  <div className="h-12 w-12 bg-muted rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-8 bg-muted rounded-md w-40 mb-6"></div>
            <Card>
              <CardContent className="p-6">
                <div className="h-40 bg-muted rounded-md w-full"></div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="mb-6">
              <CardHeader>
                <div className="h-6 bg-muted rounded-md w-32 mb-2"></div>
                <div className="h-4 bg-muted rounded-md w-40"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted rounded-md w-full"></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${animateIn ? 'animate-in fade-in duration-500' : 'opacity-0'}`}>
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-8 shadow-sm">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{getGreeting()}</span>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to MeetingFlow
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Your privacy-first meeting productivity suite. Plan agendas, take notes, manage tasks, and transcribe conversations—all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                onClick={() => setShowCreateForm(true)}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusIcon className="h-5 w-5" />
                Start New Meeting
              </Button>
              {currentMeeting && (
                <Link to={`/meeting/${currentMeeting.id}`}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                    Continue Current Meeting
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Total Meetings</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{totalMeetings}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Total Tasks</p>
                <p className="text-xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{totalTasks}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <CheckSquareIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">Pending Tasks</p>
                <p className="text-xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">{pendingTasks}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <ClockIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">Productivity</p>
                <p className="text-xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {totalTasks > 0 ? Math.round(((totalTasks - pendingTasks) / totalTasks) * 100) : 0}%
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <TrendingUpIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Meetings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-500" />
              Recent Meetings
            </h2>
            <Link to="/meetings">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-dashed"
              >
                View All
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {totalMeetings > 0 ? (
            <MeetingList limit={3} showSearch={false} />
          ) : (
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No meetings yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first meeting to start planning agendas, taking notes, and managing tasks.
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)} 
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Your First Meeting
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Tips Section */}
          {totalMeetings > 0 && (
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200/50 dark:border-amber-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LightbulbIcon className="h-5 w-5 text-amber-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                    </div>
                    <p className="text-sm">Use the <strong>voice commands</strong> by clicking the microphone button in the bottom right corner.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                    </div>
                    <p className="text-sm">Try <strong>transcribing</strong> your next meeting to automatically extract action items.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-md border-border/50 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <PlusIcon className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common actions to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                onClick={() => setShowCreateForm(true)}
              >
                <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-lg flex items-center justify-center">
                  <FileTextIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Create New Meeting</div>
                  <div className="text-xs text-muted-foreground">Start with agenda planning</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 transition-all duration-200 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/20"
                onClick={() => setShowCreateForm(true)}
              >
                <div className="h-8 w-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-lg flex items-center justify-center">
                  <MicIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Start Transcription</div>
                  <div className="text-xs text-muted-foreground">Record and transcribe</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                onClick={() => setShowCreateForm(true)}
              >
                <div className="h-8 w-8 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-lg flex items-center justify-center">
                  <CheckSquareIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Manage Tasks</div>
                  <div className="text-xs text-muted-foreground">Track action items</div>
                </div>
              </Button>
            </CardContent>
            <CardFooter className="border-t border-border/50 bg-muted/30 py-3">
              <Link to="/settings" className="w-full">
                <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                  <SettingsIcon className="h-4 w-4" />
                  Configure Settings
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Features Highlight */}
          <Card className="shadow-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-border/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-lg">Why MeetingFlow?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <UsersIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">Privacy-First</div>
                  <div className="text-xs text-muted-foreground">All data stays on your device</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BarChart3Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">No Backend Required</div>
                  <div className="text-xs text-muted-foreground">Works completely offline</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <TrendingUpIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">Real-time Collaboration</div>
                  <div className="text-xs text-muted-foreground">Share and collaborate seamlessly</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}