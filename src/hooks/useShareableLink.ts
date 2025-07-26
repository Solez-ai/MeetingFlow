import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMeetingStore } from '@/store'
import { parseShareableLinkData } from '@/utils/exportUtils'
import { useToast } from '@/hooks/use-toast'

/**
 * Hook to handle shareable link data when the app loads
 */
export const useShareableLink = () => {
  const navigate = useNavigate()
  const { addMeeting } = useMeetingStore()
  const { toast } = useToast()

  useEffect(() => {
    const handleShareableLink = async () => {
      try {
        const sharedMeeting = parseShareableLinkData()
        
        if (sharedMeeting) {
          // Add the shared meeting to the store
          addMeeting({
            ...sharedMeeting,
            title: `${sharedMeeting.title} (Shared)`,
            startTime: sharedMeeting.startTime,
            agenda: sharedMeeting.agenda,
            notes: sharedMeeting.notes,
            transcripts: sharedMeeting.transcripts,
            metadata: {
              ...sharedMeeting.metadata,
              description: sharedMeeting.metadata.description 
                ? `${sharedMeeting.metadata.description} (Imported from shared link)`
                : 'Imported from shared link'
            }
          })

          // Navigate to the meeting workspace
          navigate(`/meeting/${sharedMeeting.id}`)

          // Show success message
          toast({
            title: 'Meeting Imported',
            description: 'Successfully imported meeting from shared link',
          })

          // Clean up the URL
          const url = new URL(window.location.href)
          url.searchParams.delete('session')
          window.history.replaceState({}, document.title, url.toString())
        }
      } catch (error) {
        console.error('Error handling shareable link:', error)
        toast({
          title: 'Import Error',
          description: 'Failed to import meeting from shared link. The link may be invalid or corrupted.',
          variant: 'destructive'
        })

        // Clean up the URL even on error
        const url = new URL(window.location.href)
        url.searchParams.delete('session')
        window.history.replaceState({}, document.title, url.toString())
      }
    }

    // Only run on initial load
    handleShareableLink()
  }, []) // Empty dependency array to run only once

  return null
}