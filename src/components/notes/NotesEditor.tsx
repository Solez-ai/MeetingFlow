import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotesEditor } from '@/hooks/useNotesEditor'
import { useMeetingStore } from '@/store/meetingStore'
import './NotesEditor.css'

// Styles are now imported from NotesEditor.css

export function NotesEditor() {
  const { editor, EditorContent, lastSaved, selectedText, convertSelectionToTask, forceSave } = useNotesEditor()
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  
  // No need to apply styles programmatically as we're using CSS file
  
  if (!currentMeeting) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No meeting selected</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto">
        {editor ? (
          <div className="notes-editor">
            <div className="editor-toolbar mb-2 flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
              >
                H1
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
              >
                H2
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-accent' : ''}
              >
                Bold
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-accent' : ''}
              >
                Italic
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-accent' : ''}
              >
                Bullet List
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-accent' : ''}
              >
                Ordered List
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={editor.isActive('taskList') ? 'bg-accent' : ''}
              >
                Task List
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
              >
                Code Block
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-accent' : ''}
              >
                Quote
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'bg-accent' : ''}
              >
                Highlight
              </Button>
            </div>
            
            <EditorContent editor={editor} className="border rounded-md" />
            
            {selectedText && (
              <div className="mt-4 p-2 border rounded-md bg-muted">
                <p className="text-sm font-medium">Selected text:</p>
                <p className="text-sm">{selectedText}</p>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="mt-2"
                  onClick={convertSelectionToTask}
                >
                  Convert to Task
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {lastSaved ? (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Autosaving every 5 seconds</span>
          )}
        </div>
        <Button size="sm" onClick={forceSave}>
          Save Now
        </Button>
      </CardFooter>
    </Card>
  )
}