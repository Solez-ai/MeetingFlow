import { Meeting, AgendaItem, Task, TranscriptChunk, NoteBlock } from '@/types'

/**
 * Export utilities for meeting data
 */

// Base64 encoding/decoding utilities
export const encodeSessionData = (meeting: Meeting): string => {
  try {
    const sessionData = {
      meeting,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    return btoa(JSON.stringify(sessionData))
  } catch (error) {
    console.error('Error encoding session data:', error)
    throw new Error('Failed to encode session data')
  }
}

export const decodeSessionData = (encodedData: string): Meeting => {
  try {
    const decodedString = atob(encodedData)
    const sessionData = JSON.parse(decodedString)
    return sessionData.meeting
  } catch (error) {
    console.error('Error decoding session data:', error)
    throw new Error('Invalid session data')
  }
}

// Markdown export utilities
export const formatAgendaAsMarkdown = (agenda: AgendaItem[]): string => {
  if (agenda.length === 0) return '## Agenda\n\nNo agenda items.\n\n'
  
  let markdown = '## Agenda\n\n'
  agenda.forEach((item, index) => {
    markdown += `${index + 1}. **${item.title}** (${item.duration} min)\n`
    if (item.description) {
      markdown += `   ${item.description}\n`
    }
    markdown += '\n'
  })
  
  return markdown
}

export const formatNotesAsMarkdown = (notes: NoteBlock[]): string => {
  if (notes.length === 0) return '## Notes\n\nNo notes taken.\n\n'
  
  let markdown = '## Notes\n\n'
  notes.forEach(note => {
    switch (note.type) {
      case 'heading':
        markdown += `### ${note.content}\n\n`
        break
      case 'bullet':
        markdown += `- ${note.content}\n`
        break
      case 'todo':
        markdown += `- [ ] ${note.content}\n`
        break
      case 'code':
        markdown += `\`\`\`\n${note.content}\n\`\`\`\n\n`
        break
      case 'quote':
        markdown += `> ${note.content}\n\n`
        break
      default:
        markdown += `${note.content}\n\n`
    }
  })
  
  return markdown
}

export const formatTasksAsMarkdown = (tasks: Task[]): string => {
  if (tasks.length === 0) return '## Tasks\n\nNo tasks created.\n\n'
  
  let markdown = '## Tasks\n\n'
  
  const tasksByStatus = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  }
  
  Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
    if (statusTasks.length > 0) {
      markdown += `### ${status}\n\n`
      statusTasks.forEach(task => {
        const checkbox = status === 'Done' ? '[x]' : '[ ]'
        markdown += `- ${checkbox} **${task.title}**`
        if (task.priority !== 'Low') {
          markdown += ` (${task.priority} Priority)`
        }
        if (task.dueDate) {
          markdown += ` - Due: ${new Date(task.dueDate).toLocaleDateString()}`
        }
        markdown += '\n'
        if (task.description) {
          markdown += `  ${task.description}\n`
        }
        if (task.tags.length > 0) {
          markdown += `  Tags: ${task.tags.join(', ')}\n`
        }
        markdown += '\n'
      })
    }
  })
  
  return markdown
}

export const formatTranscriptsAsMarkdown = (transcripts: TranscriptChunk[]): string => {
  if (transcripts.length === 0) return '## Transcripts\n\nNo transcripts available.\n\n'
  
  let markdown = '## Transcripts\n\n'
  transcripts.forEach(chunk => {
    const timestamp = new Date(chunk.timestamp).toLocaleTimeString()
    markdown += `**[${timestamp}]** ${chunk.text}\n\n`
    
    if (chunk.actionItems && chunk.actionItems.length > 0) {
      markdown += `*Action Items:*\n`
      chunk.actionItems.forEach(item => {
        markdown += `- ${item}\n`
      })
      markdown += '\n'
    }
  })
  
  return markdown
}

export const exportToMarkdown = (meeting: Meeting): string => {
  let markdown = `# ${meeting.title}\n\n`
  
  // Meeting metadata
  markdown += `**Date:** ${new Date(meeting.startTime).toLocaleDateString()}\n`
  markdown += `**Time:** ${new Date(meeting.startTime).toLocaleTimeString()}`
  if (meeting.endTime) {
    markdown += ` - ${new Date(meeting.endTime).toLocaleTimeString()}`
  }
  markdown += '\n\n'
  
  if (meeting.metadata.participants && meeting.metadata.participants.length > 0) {
    markdown += `**Participants:** ${meeting.metadata.participants.join(', ')}\n\n`
  }
  
  if (meeting.metadata.description) {
    markdown += `**Description:** ${meeting.metadata.description}\n\n`
  }
  
  // Add sections
  markdown += formatAgendaAsMarkdown(meeting.agenda)
  markdown += formatNotesAsMarkdown(meeting.notes)
  markdown += formatTasksAsMarkdown(meeting.tasks)
  markdown += formatTranscriptsAsMarkdown(meeting.transcripts)
  
  return markdown
}

// Shareable link utilities
export const generateShareableLink = (meeting: Meeting): string => {
  const encodedData = encodeSessionData(meeting)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?session=${encodedData}`
}

export const parseShareableLinkData = (): Meeting | null => {
  const urlParams = new URLSearchParams(window.location.search)
  const sessionData = urlParams.get('session')
  
  if (!sessionData) return null
  
  try {
    return decodeSessionData(sessionData)
  } catch (error) {
    console.error('Error parsing shareable link data:', error)
    return null
  }
}

// File download utilities
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadMarkdown = (meeting: Meeting) => {
  const markdown = exportToMarkdown(meeting)
  const filename = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.md`
  downloadFile(markdown, filename, 'text/markdown')
}

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      return false
    }
  }
}