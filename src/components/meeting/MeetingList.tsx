import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMeetingStore } from '@/store/meetingStore'
import { Meeting } from '@/types'
import { 
  ClockIcon, 
  CalendarIcon, 
  UsersIcon, 
  TagIcon, 
  TrashIcon, 
  EditIcon,
  SearchIcon,
  FileTextIcon,
  CheckSquareIcon,
  MicIcon,
  ArrowRightIcon,
  AlertCircleIcon
} from 'lucide-react'

interface MeetingListProps {
  limit?: number
  showSearch?: boolean
  showActions?: boolean
}

export function MeetingList({ limit, showSearch = true, showActions = true }: MeetingListProps) {
  const { meetings, deleteMeeting, loadMeeting } = useMeetingStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [animateItems, setAnimateItems] = useState(false)

  // Simulate loading state and add animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => setAnimateItems(true), 100)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter meetings based on search term
  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Apply limit if specified
  const displayedMeetings = limit ? filteredMeetings.slice(0, limit) : filteredMeetings

  const handleDelete = (meetingId: string) => {
    if (deleteConfirm === meetingId) {
      deleteMeeting(meetingId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(meetingId)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Unknown duration'
    
    if (minutes < 60) {
      return `${minutes}m`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    
    return `${hours}h ${remainingMinutes}m`
  }

  const getMeetingStats = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId)
    if (!meeting) return { notes: 0, tasks: 0, transcripts: 0 }
    
    // Load full meeting data to get stats
    const fullMeeting = loadMeeting(meetingId)
    if (!fullMeeting) return { notes: 0, tasks: 0, transcripts: 0 }
    
    return {
      notes: fullMeeting.notes.length,
      tasks: fullMeeting.tasks.length,
      transcripts: fullMeeting.transcripts.length,
      pendingTasks: fullMeeting.tasks.filter(task => task.status !== 'Done').length
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {showSearch && (
          <div className="relative animate-pulse">
            <div className="h-10 bg-muted rounded-md w-full"></div>
          </div>
        )}
        
        <div className="space-y-3">
          {[1, 2, 3].slice(0, limit || 3).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded-md w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded-md w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded-md w-full mb-3"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-4 bg-muted rounded-md w-1/4"></div>
                  <div className="h-4 bg-muted rounded-md w-1/4"></div>
                  <div className="h-4 bg-muted rounded-md w-1/4"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded-full w-16"></div>
                  <div className="h-6 bg-muted rounded-full w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (displayedMeetings.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            {searchTerm ? (
              <SearchIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'No meetings found' : 'No meetings yet'}
          </h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {searchTerm 
              ? `No meetings match "${searchTerm}". Try a different search term.`
              : 'Create your first meeting to get started with agenda planning and note-taking.'
            }
          </p>
          {!searchTerm && (
            <Link to="/meeting/new">
              <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <PlusIcon className="h-4 w-4" />
                Create Your First Meeting
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {showSearch && (
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {/* Meeting List */}
      <div className="space-y-3">
        {displayedMeetings.map((meeting, index) => {
          const stats = getMeetingStats(meeting.id)
          const fullMeeting = loadMeeting(meeting.id)
          
          return (
            <Card 
              key={meeting.id} 
              className={`hover:shadow-md transition-all duration-300 border-border/50 ${
                animateItems 
                  ? 'animate-in fade-in slide-in-from-bottom-3' 
                  : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      <Link 
                        to={`/meeting/${meeting.id}`}
                        className="hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {meeting.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(meeting.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {formatDuration(fullMeeting?.metadata.duration)}
                      </span>
                    </CardDescription>
                  </div>
                  
                  {showActions && (
                    <div className="flex items-center gap-2 ml-4">
                      <Link to={`/meeting/${meeting.id}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full h-8 w-8 p-0"
                          aria-label="Edit meeting"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(meeting.id)}
                        className={`rounded-full h-8 w-8 p-0 ${deleteConfirm === meeting.id ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
                        aria-label="Delete meeting"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Meeting Description */}
                {fullMeeting?.metadata.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {fullMeeting.metadata.description}
                  </p>
                )}
                
                {/* Meeting Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <FileTextIcon className="h-3 w-3" />
                    {stats.notes} notes
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquareIcon className="h-3 w-3" />
                    {stats.tasks} tasks
                    {stats.pendingTasks > 0 && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-white text-xs font-medium">
                        {stats.pendingTasks}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <MicIcon className="h-3 w-3" />
                    {stats.transcripts} transcripts
                  </span>
                </div>
                
                {/* Participants */}
                {fullMeeting?.metadata.participants && fullMeeting.metadata.participants.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <UsersIcon className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {fullMeeting.metadata.participants.slice(0, 3).map((participant, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                        >
                          {participant}
                        </span>
                      ))}
                      {fullMeeting.metadata.participants.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{fullMeeting.metadata.participants.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {fullMeeting?.metadata.tags && fullMeeting.metadata.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {fullMeeting.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Delete Confirmation */}
                {deleteConfirm === meeting.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">
                        Are you sure you want to delete this meeting? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(meeting.id)}
                        className="gap-1"
                      >
                        <TrashIcon className="h-3 w-3" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Quick Actions */}
                {!deleteConfirm && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                    <div className="flex gap-2">
                      <Link to={`/meeting/${meeting.id}/agenda`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <FileTextIcon className="h-3 w-3 mr-1" />
                          Agenda
                        </Button>
                      </Link>
                      <Link to={`/meeting/${meeting.id}/tasks`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <CheckSquareIcon className="h-3 w-3 mr-1" />
                          Tasks
                        </Button>
                      </Link>
                    </div>
                    <Link to={`/meeting/${meeting.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs gap-1 border-dashed"
                      >
                        Open
                        <ArrowRightIcon className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Show More Link */}
      {limit && filteredMeetings.length > limit && (
        <div className="text-center pt-4">
          <Link to="/meetings">
            <Button 
              variant="outline" 
              className="gap-2 border-dashed"
            >
              View All {filteredMeetings.length} Meetings
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}