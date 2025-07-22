import { NoteBlock } from '@/types'

/**
 * Converts HTML content from TipTap editor to NoteBlock array
 * This is a simplified implementation - in a real app, you'd parse the HTML
 * more thoroughly to create structured NoteBlocks
 */
export function htmlToNoteBlocks(html: string): Omit<NoteBlock, 'id' | 'timestamp'>[] {
  // Simple implementation - in a real app, you'd use a proper HTML parser
  // and convert different elements to different block types
  
  // Split by major block elements
  const blocks: Omit<NoteBlock, 'id' | 'timestamp'>[] = []
  
  // Check if HTML is empty
  if (!html || html === '<p></p>') {
    return []
  }
  
  // Very basic parsing - in a real app, you'd use a proper HTML parser
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Process each child node
  Array.from(tempDiv.children).forEach(element => {
    let type: NoteBlock['type'] = 'paragraph'
    let content = element.innerHTML
    
    // Determine block type based on tag name
    switch (element.tagName.toLowerCase()) {
      case 'h1':
      case 'h2':
      case 'h3':
        type = 'heading'
        break
      case 'ul':
        if (element.getAttribute('data-type') === 'taskList') {
          type = 'todo'
        } else {
          type = 'bullet'
        }
        break
      case 'pre':
        type = 'code'
        break
      case 'blockquote':
        type = 'quote'
        break
      default:
        type = 'paragraph'
    }
    
    blocks.push({
      type,
      content: element.outerHTML,
    })
  })
  
  return blocks
}

/**
 * Converts NoteBlock array to HTML string for TipTap editor
 */
export function noteBlocksToHtml(blocks: NoteBlock[]): string {
  if (!blocks || blocks.length === 0) {
    return ''
  }
  
  // In a real app, you'd convert each block type to appropriate HTML
  // This is a simplified implementation
  return blocks.map(block => block.content).join('\n')
}