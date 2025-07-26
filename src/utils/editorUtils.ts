import { NoteBlock } from '@/types'

/**
 * Converts HTML content from TipTap editor to NoteBlock array
 * This implementation uses DOM parsing to create structured NoteBlocks
 */
export function htmlToNoteBlocks(html: string): Omit<NoteBlock, 'id' | 'timestamp'>[] {
  // Check if HTML is empty
  if (!html || html === '<p></p>' || html === '<p></p>\n') {
    return []
  }
  
  const blocks: Omit<NoteBlock, 'id' | 'timestamp'>[] = []
  
  // Create a DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // Process each child node in the body
  Array.from(doc.body.children).forEach(element => {
    let type: NoteBlock['type'] = 'paragraph'
    
    // Determine block type based on tag name and attributes
    if (element.tagName.toLowerCase().match(/^h[1-6]$/)) {
      type = 'heading'
    } else if (element.tagName.toLowerCase() === 'ul') {
      if (element.getAttribute('data-type') === 'taskList') {
        type = 'todo'
      } else {
        type = 'bullet'
      }
    } else if (element.tagName.toLowerCase() === 'ol') {
      type = 'bullet' // We're treating ordered lists as bullet type for simplicity
    } else if (element.tagName.toLowerCase() === 'pre') {
      type = 'code'
    } else if (element.tagName.toLowerCase() === 'blockquote') {
      type = 'quote'
    }
    
    // Create the note block
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
  
  return blocks.map(block => block.content).join('\n')
}

/**
 * Extract plain text content from HTML
 */
export function extractTextFromHtml(html: string): string {
  if (!html) return ''
  
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

/**
 * Convert TipTap JSON to Markdown
 * This is a simplified implementation - in a real app, you'd use a proper converter
 */
export function tipTapToMarkdown(content: any): string {
  if (!content) return ''
  
  // Process content recursively
  const processNode = (node: any, level = 0): string => {
    if (!node) return ''
    
    switch (node.type) {
      case 'doc':
        return node.content?.map((child: any) => processNode(child)).join('\n\n') || ''
        
      case 'paragraph':
        return node.content?.map((child: any) => processNode(child)).join('') || ''
        
      case 'heading':
        const headingLevel = '#'.repeat(node.attrs?.level || 1)
        return `${headingLevel} ${node.content?.map((child: any) => processNode(child)).join('') || ''}`
        
      case 'bulletList':
        return node.content?.map((child: any) => processNode(child, level)).join('\n') || ''
        
      case 'orderedList':
        return node.content?.map((child: any, index: number) => {
          const processedContent = processNode(child, level)
          return processedContent.replace(/^- /, `${index + 1}. `)
        }).join('\n') || ''
        
      case 'taskList':
        return node.content?.map((child: any) => processNode(child, level)).join('\n') || ''
        
      case 'listItem':
        const indent = ' '.repeat(level * 2)
        const itemContent = node.content?.map((child: any) => processNode(child, level + 1)).join('') || ''
        return `${indent}- ${itemContent}`
        
      case 'taskItem':
        const taskIndent = ' '.repeat(level * 2)
        const checked = node.attrs?.checked ? 'x' : ' '
        const taskContent = node.content?.map((child: any) => processNode(child, level + 1)).join('') || ''
        return `${taskIndent}- [${checked}] ${taskContent}`
        
      case 'blockquote':
        const quoteContent = node.content?.map((child: any) => processNode(child)).join('\n') || ''
        return quoteContent.split('\n').map((line: string) => `> ${line}`).join('\n')
        
      case 'codeBlock':
        const code = node.content?.map((child: any) => processNode(child)).join('\n') || ''
        const language = node.attrs?.language || ''
        return `\`\`\`${language}\n${code}\n\`\`\``
        
      case 'text':
        let text = node.text || ''
        
        // Apply marks
        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case 'bold':
                text = `**${text}**`
                break
              case 'italic':
                text = `*${text}*`
                break
              case 'code':
                text = `\`${text}\``
                break
              case 'highlight':
                text = `==${text}==`
                break
              // Add more mark types as needed
            }
          }
        }
        
        return text
        
      default:
        return node.content?.map((child: any) => processNode(child)).join('') || ''
    }
  }
  
  return processNode(content)
}

/**
 * Export notes to Markdown
 */
export function exportNotesToMarkdown(notes: NoteBlock[]): string {
  if (!notes || notes.length === 0) return ''
  
  let markdown = '# Meeting Notes\n\n'
  
  notes.forEach(note => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(note.content, 'text/html')
    const element = doc.body.firstElementChild
    
    if (!element) return
    
    switch (note.type) {
      case 'heading':
        const level = element.tagName.toLowerCase().replace('h', '')
        const headingText = element.textContent || ''
        markdown += `${'#'.repeat(parseInt(level))} ${headingText}\n\n`
        break
        
      case 'paragraph':
        markdown += `${element.textContent || ''}\n\n`
        break
        
      case 'bullet':
        const listItems = Array.from(element.querySelectorAll('li'))
        listItems.forEach(item => {
          markdown += `- ${item.textContent || ''}\n`
        })
        markdown += '\n'
        break
        
      case 'todo':
        const todoItems = Array.from(element.querySelectorAll('li'))
        todoItems.forEach(item => {
          const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement
          const isChecked = checkbox?.checked
          markdown += `- [${isChecked ? 'x' : ' '}] ${item.textContent?.replace(/^\s*/, '') || ''}\n`
        })
        markdown += '\n'
        break
        
      case 'code':
        const code = element.textContent || ''
        const language = element.getAttribute('data-language') || ''
        markdown += `\`\`\`${language}\n${code}\n\`\`\`\n\n`
        break
        
      case 'quote':
        const quoteText = element.textContent || ''
        markdown += quoteText.split('\n').map(line => `> ${line}`).join('\n') + '\n\n'
        break
    }
  })
  
  return markdown
}