import { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import { lowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { useMeetingStore } from '@/store/meetingStore'
import { NoteBlock } from '@/types'
import { htmlToNoteBlocks, noteBlocksToHtml } from '@/utils/editorUtils'
import { debounce } from '@/lib/utils'
import { extractTasksFromNotes } from '@/utils/taskExtractor'

export function useNotesEditor() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const addNoteBlock = useMeetingStore(state => state.addNoteBlock)
  const updateNoteBlock = useMeetingStore(state => state.updateNoteBlock)
  const saveMeetingToStorage = useMeetingStore(state => state.saveMeetingToStorage)
  const addTask = useMeetingStore(state => state.addTask)
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const [potentialTasks, setPotentialTasks] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  // Create a debounced save function to prevent excessive saves
  const debouncedSave = useCallback(
    debounce((content: string) => {
      if (!currentMeeting) return
      
      setIsSaving(true)
      
      try {
        // Convert editor content to note blocks
        const noteBlocks = htmlToNoteBlocks(content)
        
        // If there are existing notes, update them; otherwise add new ones
        if (currentMeeting.notes.length > 0) {
          // This is simplified - in a real app, you'd do a more sophisticated diff
          currentMeeting.notes.forEach((block, index) => {
            if (index < noteBlocks.length) {
              updateNoteBlock(block.id, noteBlocks[index])
            }
          })
          
          // Add any new blocks
          if (noteBlocks.length > currentMeeting.notes.length) {
            for (let i = currentMeeting.notes.length; i < noteBlocks.length; i++) {
              addNoteBlock(noteBlocks[i])
            }
          }
        } else {
          // Add new note blocks
          noteBlocks.forEach(block => {
            addNoteBlock(block)
          })
        }
        
        // Save to localStorage
        saveMeetingToStorage()
        setLastSaved(new Date())
        
        // Extract potential tasks from the content
        const extractedTasks = extractTasksFromNotes(content)
        if (extractedTasks.length > 0) {
          setPotentialTasks(extractedTasks)
        }
      } finally {
        setIsSaving(false)
      }
    }, 1000),
    [currentMeeting, addNoteBlock, updateNoteBlock, saveMeetingToStorage]
  )
  
  // Initialize editor with TipTap extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
        onChecked: (node, checked) => {
          // When a task item is checked, create a task in the task manager
          if (checked && node.textContent) {
            addTask({
              title: node.textContent,
              priority: 'Medium',
              status: 'Done', // Since it's already checked
              tags: ['notes', 'auto-extracted'],
              createdFrom: 'notes',
            })
            
            // Show success toast
            const event = new CustomEvent('toast', {
              detail: {
                title: 'Task created',
                description: 'Task automatically created from checked item',
                variant: 'success'
              }
            })
            window.dispatchEvent(event)
          }
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your notes here...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
    ],
    content: currentMeeting?.notes ? noteBlocksToHtml(currentMeeting.notes) : '',
    onSelectionUpdate: ({ editor }) => {
      const selection = editor.state.selection
      const text = editor.state.doc.textBetween(
        selection.from,
        selection.to,
        ' '
      )
      setSelectedText(text)
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      
      // Skip if content is empty
      if (!content || content === '<p></p>') return
      
      // Save content with debounce
      debouncedSave(content)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
      },
    },
  })
  
  // Handle autosave with 5-second intervals as a backup
  useEffect(() => {
    if (!editor || !currentMeeting) return
    
    const saveTimer = setInterval(() => {
      const content = editor.getHTML()
      
      // Skip if content is empty or unchanged
      if (!content || content === '<p></p>') return
      
      // Force save
      forceSave()
    }, 5000) // 5-second interval
    
    return () => clearInterval(saveTimer)
  }, [editor, currentMeeting])
  
  // Convert selected text to task
  const convertSelectionToTask = useCallback(() => {
    if (!editor || !selectedText || !currentMeeting) return
    
    // Add a new task with the selected text
    const taskId = useMeetingStore.getState().addTask({
      title: selectedText,
      priority: 'Medium',
      status: 'Todo',
      tags: ['notes'],
      createdFrom: 'notes',
    })
    
    if (taskId) {
      // Highlight the text in the editor
      editor.commands.setTextSelection({
        from: editor.state.selection.from,
        to: editor.state.selection.to,
      })
      
      editor.commands.setHighlight({ color: '#4f46e5' })
      
      // Save the changes
      forceSave()
      
      // Show success toast
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Task created',
          description: 'Nice! That action is on your list.',
          variant: 'success'
        }
      })
      window.dispatchEvent(event)
      
      // Show mini confetti
      const confettiEvent = new CustomEvent('confetti', {
        detail: { intensity: 'low' }
      })
      window.dispatchEvent(confettiEvent)
      
      // Clear selected text
      setSelectedText('')
    }
  }, [editor, selectedText, currentMeeting])
  
  // Create task from potential task
  const createTaskFromSuggestion = useCallback((text: string) => {
    if (!currentMeeting) return
    
    // Add a new task
    const taskId = useMeetingStore.getState().addTask({
      title: text,
      priority: 'Medium',
      status: 'Todo',
      tags: ['notes', 'auto-extracted'],
      createdFrom: 'notes',
    })
    
    if (taskId) {
      // Remove from potential tasks
      setPotentialTasks(prev => prev.filter(t => t !== text))
      
      // Show success toast
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Task created',
          description: 'Task created from suggestion',
          variant: 'success'
        }
      })
      window.dispatchEvent(event)
    }
  }, [currentMeeting])
  
  // Force save
  const forceSave = useCallback(() => {
    if (!editor || !currentMeeting) return
    
    const content = editor.getHTML()
    
    // Skip if content is empty
    if (!content || content === '<p></p>') return
    
    setIsSaving(true)
    
    try {
      // Convert editor content to note blocks
      const noteBlocks = htmlToNoteBlocks(content)
      
      // If there are existing notes, update them; otherwise add new ones
      if (currentMeeting.notes.length > 0) {
        currentMeeting.notes.forEach((block, index) => {
          if (index < noteBlocks.length) {
            updateNoteBlock(block.id, noteBlocks[index])
          }
        })
        
        // Add any new blocks
        if (noteBlocks.length > currentMeeting.notes.length) {
          for (let i = currentMeeting.notes.length; i < noteBlocks.length; i++) {
            addNoteBlock(noteBlocks[i])
          }
        }
      } else {
        // Add new note blocks
        noteBlocks.forEach(block => {
          addNoteBlock(block)
        })
      }
      
      // Save to localStorage
      saveMeetingToStorage()
      setLastSaved(new Date())
    } finally {
      setIsSaving(false)
    }
  }, [editor, currentMeeting, addNoteBlock, updateNoteBlock, saveMeetingToStorage])
  
  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        // Force save before unmounting
        const content = editor.getHTML()
        if (content && content !== '<p></p>') {
          forceSave()
        }
      }
    }
  }, [editor, forceSave])
  
  return {
    editor,
    EditorContent,
    lastSaved,
    selectedText,
    potentialTasks,
    isSaving,
    convertSelectionToTask,
    createTaskFromSuggestion,
    forceSave,
  }
}