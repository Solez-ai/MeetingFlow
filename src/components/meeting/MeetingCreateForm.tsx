import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMeetingStore } from '@/store/meetingStore'
import { PlusIcon, ClockIcon } from 'lucide-react'

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
        updateMeeting({
          id: meeting.id,
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
        navigate(`/meeting/${meeting.id}`)
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Create New Meeting
        </CardTitle>
        <CardDescription>
          Set up a new meeting with agenda planning, notes, and task management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Meeting Title *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Weekly Team Standup"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Duration (minutes) *
            </label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="480"
              step="5"
              placeholder="60"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
              className={errors.duration ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.duration && (
              <p className="text-sm text-red-600">{errors.duration}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Recommended: 30-90 minutes for most meetings
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              id="description"
              placeholder="Brief description of the meeting purpose..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label htmlFor="participants" className="text-sm font-medium">
              Participants (optional)
            </label>
            <Input
              id="participants"
              type="text"
              placeholder="John Doe, Jane Smith, Alex Johnson"
              value={formData.participants}
              onChange={(e) => handleInputChange('participants', e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple participants with commas
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags (optional)
            </label>
            <Input
              id="tags"
              type="text"
              placeholder="standup, planning, review"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Create Meeting
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
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}