import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMeetingStore } from '@/store/meetingStore'
import { 
  PlusIcon, 
  ClockIcon, 
  UsersIcon, 
  TagIcon, 
  FileTextIcon, 
  MicIcon,
  CalendarIcon,
  XIcon
} from 'lucide-react'

interface MeetingCreateFormProps {
  onCancel?: () => void
  onSuccess?: (meetingId: string) => void
}

export function MeetingCreateForm({ onCancel, onSuccess }: MeetingCreateFormProps) {
  const navigate = useNavigate()
  const createMeeting = useMeetingStore(state => state.createMeeting)
  
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    description: '',
    participants: '',
    tags: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTranscribe, setShowTranscribe] = useState(false)
  const [formFocus, setFormFocus] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required'
    }
    
    if (formData.duration < 5) {
      newErrors.duration = 'Duration must be at least 5 minutes'
    }
    
    if (formData.duration > 480) {
      newErrors.duration = 'Duration cannot exceed 8 hours (480 minutes)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create the meeting
      const meeting = createMeeting(formData.title.trim(), formData.duration)
      
      // Add metadata if provided
      if (formData.description || formData.participants || formData.tags) {
        const participants = formData.participants
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0)
        
        const tags = formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
        
        // Update meeting with metadata
        const updateMeeting = useMeetingStore.getState().updateMeeting
        updateMeeting(meeting.id, {
          metadata: {
            ...meeting.metadata,
            participants,
            tags,
            description: formData.description.trim() || undefined
          }
        })
      }
      
      // Call success callback or navigate
      if (onSuccess) {
        onSuccess(meeting.id)
      } else {
        // If transcribe option is enabled, navigate to transcription page
        if (showTranscribe) {
          navigate(`/meeting/${meeting.id}/transcribe`)
        } else {
          navigate(`/meeting/${meeting.id}`)
        }
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      setErrors({ submit: 'Failed to create meeting. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFocus = (field: string) => {
    setFormFocus(field)
  }

  const handleBlur = () => {
    setFormFocus(null)
  }

  const getInputClasses = (field: string) => {
    return `transition-all duration-200 ${
      errors[field] 
        ? 'border-red-500 focus:ring-red-500' 
        : formFocus === field
        ? 'border-primary/50 ring-2 ring-primary/20' 
        : ''
    }`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <PlusIcon className="h-5 w-5 text-primary" />
            Create New Meeting
          </CardTitle>
          
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="rounded-full"
              aria-label="Cancel"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-base">
          Set up a new meeting with agenda planning, notes, and task management
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-primary" />
              Meeting Title *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Weekly Team Standup"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              onFocus={() => handleFocus('title')}
              onBlur={handleBlur}
              className={getInputClasses('title')}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.title}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-primary" />
              Duration (minutes) *
            </label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                min="5"
                max="480"
                step="5"
                placeholder="60"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                onFocus={() => handleFocus('duration')}
                onBlur={handleBlur}
                className={`flex-1 ${getInputClasses('duration')}`}
                disabled={isSubmitting}
              />
              <div className="flex gap-1">
                {[30, 60, 90].map(duration => (
                  <Button
                    key={duration}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('duration', duration)}
                    className={`px-2 py-1 h-auto ${formData.duration === duration ? 'bg-primary/10 border-primary/30' : ''}`}
                  >
                    {duration}m
                  </Button>
                ))}
              </div>
            </div>
            {errors.duration && (
              <p className="text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.duration}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Recommended: 30-90 minutes for most meetings
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
              Description (optional)
            </label>
            <Textarea
              id="description"
              placeholder="Brief description of the meeting purpose..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onFocus={() => handleFocus('description')}
              onBlur={handleBlur}
              className={getInputClasses('description')}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label htmlFor="participants" className="text-sm font-medium flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              Participants (optional)
            </label>
            <Input
              id="participants"
              type="text"
              placeholder="John Doe, Jane Smith, Alex Johnson"
              value={formData.participants}
              onChange={(e) => handleInputChange('participants', e.target.value)}
              onFocus={() => handleFocus('participants')}
              onBlur={handleBlur}
              className={getInputClasses('participants')}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple participants with commas
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-muted-foreground" />
              Tags (optional)
            </label>
            <Input
              id="tags"
              type="text"
              placeholder="standup, planning, review"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              onFocus={() => handleFocus('tags')}
              onBlur={handleBlur}
              className={getInputClasses('tags')}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Transcription Option */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="transcribe"
              checked={showTranscribe}
              onChange={() => setShowTranscribe(!showTranscribe)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="transcribe" className="text-sm font-medium flex items-center gap-2">
              <MicIcon className="h-4 w-4 text-green-500" />
              Start transcription after meeting creation
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 border-t bg-muted/30 p-6">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Creating...
            </>
          ) : (
            <>
              {showTranscribe ? (
                <>
                  <MicIcon className="h-4 w-4" />
                  Create & Start Transcription
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4" />
                  Create Meeting
                </>
              )}
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
            size="lg"
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}