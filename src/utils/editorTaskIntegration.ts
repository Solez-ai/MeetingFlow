import { Editor } from '@tiptap/react'
import { Task } from '@/types'
import { extractTextFromHtml } from './editorUtils'
import { extractTasksFromNotes } from './taskExtractor'

/**
 * Extract tasks from editor content
 */
export function extractTasksFromEditor(editor: Editor): Array<{title: string; description?: string; tags: string[]; priority: 'Low' | 'Medium' | 'High'}> {
  if (!editor) return []
  
  const content = editor.getHTML()
  if (!content) return []
  
  const text = extractTextFromHtml(content)
  return extractTasksFromNotes(text)
}

/**
 * Highlight text in editor
 */
export function highlightTextInEditor(editor: Editor, text: string, color: string = '#4f46e5'): boolean {
  if (!editor || !text) return false
  
  // Get editor content as text
  const editorContent = editor.getText()
  
  // Find the text in the editor
  const index = editorContent.indexOf(text)
  if (index === -1) return false
  
  // Set selection to the text
  editor.commands.setTextSelection({
    from: index,
    to: index + text.length,
  })
  
  // Apply highlight
  editor.commands.setHighlight({ color })
  
  return true
}

/**
 * Create a task from editor selection
 */
export function createTaskFromSelection(
  editor: Editor,
  addTask: (task: Omit<Task, 'id' | 'created'>) => string,
  options: {
    priority?: 'Low' | 'Medium' | 'High',
    tags?: string[],
    highlightColor?: string
  } = {}
): string | null {
  if (!editor) return null
  
  // Get selected text
  const { from, to } = editor.state.selection
  const selectedText = editor.state.doc.textBetween(from, to, ' ')
  
  if (!selectedText) return null
  
  // Create task
  const taskId = addTask({
    title: selectedText,
    priority: options.priority || 'Medium',
    status: 'Todo',
    tags: options.tags || ['notes'],
    createdFrom: 'notes',
  })
  
  if (taskId) {
    // Highlight the text
    editor.commands.setTextSelection({
      from,
      to,
    })
    
    editor.commands.setHighlight({ color: options.highlightColor || '#4f46e5' })
  }
  
  return taskId
}

/**
 * Convert task list items to tasks
 */
export function convertTaskListItemsToTasks(
  editor: Editor,
  addTask: (task: Omit<Task, 'id' | 'created'>) => string
): string[] {
  if (!editor) return []
  
  const taskIds: string[] = []
  
  // Find all checked task items
  editor.state.doc.descendants((node, _pos) => {
    if (node.type.name === 'taskItem' && node.attrs.checked) {
      // Get the text content of the task item
      const text = node.textContent
      
      if (text) {
        // Create a task
        const taskId = addTask({
          title: text,
          priority: 'Medium',
          status: 'Done', // Since it's already checked
          tags: ['notes', 'task-list'],
          createdFrom: 'notes',
        })
        
        if (taskId) {
          taskIds.push(taskId)
        }
      }
      
      return true
    }
    
    return false
  })
  
  return taskIds
}