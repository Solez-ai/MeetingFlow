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

export function useNotesEditor() {
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  const addNoteBlock = useMeetingStore(state => state.addNoteBlock)
  const updateNoteBlock = useMeetingStore(state => state.updateNoteBlock)
  const saveMeetingToStorage = useMeetingStore(state => state.saveMeetingToStorage)
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  
  // Initialize editor with TipTap extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Start typing your notes here...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
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
      // We'll handle autosave in a separate effect
    },
  })
  
  // Handle autosave with 5-second intervals
  useEffect(() => {
    if (!editor || !currentMeeting) return
    
    const saveTimer = setInterval(() => {
      const content = editor.getHTML()
      
      // Skip if content is empty or unchanged
      if (!content || content === '<p></p>') return
      
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
      } else {
        // Add new note blocks
        noteBlocks.forEach(block => {
          addNoteBlock(block)
        })
      }
      
      // Save to localStorage
      saveMeetingToStorage()
      setLastSaved(new Date())
    }, 5000) // 5-second interval
    
    return () => clearInterval(saveTimer)
  }, [editor, currentMeeting, addNoteBlock, updateNoteBlock, saveMeetingToStorage])
  
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
      
      editor.commands.setHighlight()
      
      // Save the changes
      saveMeetingToStorage()
      setLastSaved(new Date())
    }
  }, [editor, selectedText, currentMeeting, saveMeetingToStorage])
  
  // Force save
  const forceSave = useCallback(() => {
    if (!editor || !currentMeeting) return
    
    const content = editor.getHTML()
    
    // Skip if content is empty
    if (!content || content === '<p></p>') return
    
    // Convert editor content to note blocks
    const noteBlocks = htmlToNoteBlocks(content)
    
    // If there are existing notes, update them; otherwise add new ones
    if (currentMeeting.notes.length > 0) {
      currentMeeting.notes.forEach((block, index) => {
        if (index < noteBlocks.length) {
          updateNoteBlock(block.id, noteBlocks[index])
        }
      })
    } else {
      // Add new note blocks
      noteBlocks.forEach(block => {
        addNoteBlock(block)
      })
    }
    
    // Save to localStorage
    saveMeetingToStorage()
    setLastSaved(new Date())
  }, [editor, currentMeeting, addNoteBlock, updateNoteBlock, saveMeetingToStorage])
  
  return {
    editor,
    EditorContent,
    lastSaved,
    selectedText,
    convertSelectionToTask,
    forceSave,
  }
}