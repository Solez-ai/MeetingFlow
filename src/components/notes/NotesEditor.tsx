import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotesEditor } from '@/hooks/useNotesEditor'
import { useMeetingStore } from '@/store/meetingStore'
import { Sparkles, Save, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './NotesEditor.css'

export function NotesEditor() {
  const { 
    editor, 
    EditorContent, 
    lastSaved, 
    selectedText, 
    potentialTasks,
    isSaving,
    convertSelectionToTask, 
    createTaskFromSuggestion,
    forceSave 
  } = useNotesEditor()
  
  const currentMeeting = useMeetingStore(state => state.currentMeeting)
  
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
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle>Notes</CardTitle>
          {isSaving && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto relative">
        {editor ? (
          <div className="notes-editor">
            <div className="editor-toolbar mb-2 flex gap-1.5 flex-wrap bg-muted/50 p-1.5 rounded-md">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
              >
                H1
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
              >
                H2
              </Button>
              <div className="h-5 w-px bg-muted-foreground/20 mx-0.5" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M5.10505 12C4.70805 12 4.4236 11.912 4.25171 11.736C4.0839 11.5559 4 11.2715 4 10.8827V4.11733C4 3.72033 4.08595 3.43588 4.25784 3.26398C4.43383 3.08799 4.71623 3 5.10505 3H8.11841C9.47123 3 10.5363 3.30607 11.3138 3.9182C12.0953 4.53033 12.486 5.35589 12.486 6.39487C12.486 7.43386 12.0953 8.25942 11.3138 8.87155C10.5363 9.47959 9.47123 9.78361 8.11841 9.78361H6.00292V10.8827C6.00292 11.2715 5.91697 11.5559 5.74508 11.736C5.57319 11.912 5.28874 12 4.90401 12H5.10505ZM7.77868 8.01997C8.49462 8.01997 9.04254 7.86256 9.42318 7.54775C9.80382 7.23294 9.99414 6.79329 9.99414 6.22882C9.99414 5.66436 9.80382 5.2247 9.42318 4.90989C9.04254 4.59508 8.49462 4.43767 7.77868 4.43767H6.00292V8.01997H7.77868Z" fill="currentColor"></path>
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M5.67494 3.50017C5.67494 3.25164 5.77541 3.00797 5.96587 2.82877C6.15634 2.64958 6.41333 2.55261 6.67627 2.55261H10.4777C10.7406 2.55261 10.9976 2.64958 11.1881 2.82877C11.3786 3.00797 11.479 3.25164 11.479 3.50017C11.479 3.7487 11.3786 3.99238 11.1881 4.17157C10.9976 4.35077 10.7406 4.44773 10.4777 4.44773H9.27742L7.19201 10.5523H8.39228C8.65522 10.5523 8.91221 10.6493 9.10268 10.8285C9.29315 11.0077 9.39361 11.2514 9.39361 11.4999C9.39361 11.7484 9.29315 11.9921 9.10268 12.1713C8.91221 12.3505 8.65522 12.4475 8.39228 12.4475H4.59085C4.32791 12.4475 4.07092 12.3505 3.88045 12.1713C3.68999 11.9921 3.58952 11.7484 3.58952 11.4999C3.58952 11.2514 3.68999 11.0077 3.88045 10.8285C4.07092 10.6493 4.32791 10.5523 4.59085 10.5523H5.79112L7.87653 4.44773H6.67627C6.41333 4.44773 6.15634 4.35077 5.96587 4.17157C5.77541 3.99238 5.67494 3.7487 5.67494 3.50017Z" fill="currentColor"></path>
                </svg>
              </Button>
              <div className="h-5 w-px bg-muted-foreground/20 mx-0.5" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M1.5 5.25C1.91421 5.25 2.25 4.91421 2.25 4.5C2.25 4.08579 1.91421 3.75 1.5 3.75C1.08579 3.75 0.75 4.08579 0.75 4.5C0.75 4.91421 1.08579 5.25 1.5 5.25ZM4.5 4.5C4.5 4.22386 4.72386 4 5 4H13.5C13.7761 4 14 4.22386 14 4.5C14 4.77614 13.7761 5 13.5 5H5C4.72386 5 4.5 4.77614 4.5 4.5ZM5 7C4.72386 7 4.5 7.22386 4.5 7.5C4.5 7.77614 4.72386 8 5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H5ZM5 10C4.72386 10 4.5 10.2239 4.5 10.5C4.5 10.7761 4.72386 11 5 11H13.5C13.7761 11 14 10.7761 14 10.5C14 10.2239 13.7761 10 13.5 10H5ZM2.25 7.5C2.25 7.91421 1.91421 8.25 1.5 8.25C1.08579 8.25 0.75 7.91421 0.75 7.5C0.75 7.08579 1.08579 6.75 1.5 6.75C1.91421 6.75 2.25 7.08579 2.25 7.5ZM1.5 11.25C1.91421 11.25 2.25 10.9142 2.25 10.5C2.25 10.0858 1.91421 9.75 1.5 9.75C1.08579 9.75 0.75 10.0858 0.75 10.5C0.75 10.9142 1.08579 11.25 1.5 11.25Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M1.5 5.25C1.66148 5.25 1.79122 5.17877 1.87121 5.05121C1.95852 4.91071 2 4.71837 2 4.5C2 4.28163 1.95852 4.08929 1.87121 3.94879C1.79122 3.82123 1.66148 3.75 1.5 3.75C1.33852 3.75 1.20878 3.82123 1.12879 3.94879C1.04148 4.08929 1 4.28163 1 4.5C1 4.71837 1.04148 4.91071 1.12879 5.05121C1.20878 5.17877 1.33852 5.25 1.5 5.25ZM3.5 4.5C3.5 4.22386 3.72386 4 4 4H13.5C13.7761 4 14 4.22386 14 4.5C14 4.77614 13.7761 5 13.5 5H4C3.72386 5 3.5 4.77614 3.5 4.5ZM4 7C3.72386 7 3.5 7.22386 3.5 7.5C3.5 7.77614 3.72386 8 4 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H4ZM4 10C3.72386 10 3.5 10.2239 3.5 10.5C3.5 10.7761 3.72386 11 4 11H13.5C13.7761 11 14 10.7761 14 10.5C14 10.2239 13.7761 10 13.5 10H4ZM1.91962 7.5C1.91962 7.71837 1.87814 7.91071 1.79083 8.05121C1.71084 8.17877 1.5811 8.25 1.41962 8.25C1.25815 8.25 1.12841 8.17877 1.04842 8.05121C0.961106 7.91071 0.919624 7.71837 0.919624 7.5C0.919624 7.28163 0.961106 7.08929 1.04842 6.94879C1.12841 6.82123 1.25815 6.75 1.41962 6.75C1.5811 6.75 1.71084 6.82123 1.79083 6.94879C1.87814 7.08929 1.91962 7.28163 1.91962 7.5ZM1.29462 11.25C1.45609 11.25 1.58584 11.1788 1.66583 11.0512C1.75314 10.9107 1.79462 10.7184 1.79462 10.5C1.79462 10.2816 1.75314 10.0893 1.66583 9.94879C1.58584 9.82123 1.45609 9.75 1.29462 9.75C1.13314 9.75 1.0034 9.82123 0.923412 9.94879C0.836099 10.0893 0.794617 10.2816 0.794617 10.5C0.794617 10.7184 0.836099 10.9107 0.923412 11.0512C1.0034 11.1788 1.13314 11.25 1.29462 11.25Z" fill="currentColor"></path>
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={editor.isActive('taskList') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M2.5 4.5C2.5 4.22386 2.72386 4 3 4H12C12.2761 4 12.5 4.22386 12.5 4.5C12.5 4.77614 12.2761 5 12 5H3C2.72386 5 2.5 4.77614 2.5 4.5ZM2.5 7.5C2.5 7.22386 2.72386 7 3 7H12C12.2761 7 12.5 7.22386 12.5 7.5C12.5 7.77614 12.2761 8 12 8H3C2.72386 8 2.5 7.77614 2.5 7.5ZM2.5 10.5C2.5 10.2239 2.72386 10 3 10H12C12.2761 10 12.5 10.2239 12.5 10.5C12.5 10.7761 12.2761 11 12 11H3C2.72386 11 2.5 10.7761 2.5 10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
              <div className="h-5 w-px bg-muted-foreground/20 mx-0.5" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M9.96424 2.68571C10.0668 2.42931 9.94209 2.13833 9.6857 2.03577C9.4293 1.93322 9.13832 2.05792 9.03576 2.31432L5.03576 12.3143C4.9332 12.5707 5.05791 12.8617 5.3143 12.9642C5.5707 13.0668 5.86168 12.9421 5.96424 12.6857L9.96424 2.68571ZM3.85355 5.14646C4.04882 5.34172 4.04882 5.6583 3.85355 5.85356L2.20711 7.50001L3.85355 9.14646C4.04882 9.34172 4.04882 9.6583 3.85355 9.85356C3.65829 10.0488 3.34171 10.0488 3.14645 9.85356L1.14645 7.85356C0.951184 7.6583 0.951184 7.34172 1.14645 7.14646L3.14645 5.14646C3.34171 4.9512 3.65829 4.9512 3.85355 5.14646ZM11.1464 5.14646C11.3417 4.9512 11.6583 4.9512 11.8536 5.14646L13.8536 7.14646C14.0488 7.34172 14.0488 7.6583 13.8536 7.85356L11.8536 9.85356C11.6583 10.0488 11.3417 10.0488 11.1464 9.85356C10.9512 9.6583 10.9512 9.34172 11.1464 9.14646L12.7929 7.50001L11.1464 5.85356C10.9512 5.6583 10.9512 5.34172 11.1464 5.14646Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3.5 5.5L4.5 4.5H6.5V8.5H4.5V10.5L3.5 11.5V5.5ZM8.5 5.5L9.5 4.5H11.5V8.5H9.5V10.5L8.5 11.5V5.5Z" fill="currentColor"></path>
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'bg-accent' : ''}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M2.10876 9.75C2.4619 9.75 2.75 10.0381 2.75 10.3912C2.75 10.7444 2.4619 11.0325 2.10876 11.0325C1.75561 11.0325 1.4675 10.7444 1.4675 10.3912C1.4675 10.0381 1.75561 9.75 2.10876 9.75ZM3.5 10.3912C3.5 10.0381 3.78811 9.75 4.14126 9.75C4.4944 9.75 4.78251 10.0381 4.78251 10.3912C4.78251 10.7444 4.4944 11.0325 4.14126 11.0325C3.78811 11.0325 3.5 10.7444 3.5 10.3912ZM5.53251 9.75C5.87565 9.75 6.16376 10.0381 6.16376 10.3912C6.16376 10.7444 5.87565 11.0325 5.53251 11.0325C5.18937 11.0325 4.90126 10.7444 4.90126 10.3912C4.90126 10.0381 5.18937 9.75 5.53251 9.75ZM6.88251 10.3912C6.88251 10.0381 7.17062 9.75 7.52376 9.75C7.8769 9.75 8.16501 10.0381 8.16501 10.3912C8.16501 10.7444 7.8769 11.0325 7.52376 11.0325C7.17062 11.0325 6.88251 10.7444 6.88251 10.3912ZM9.27751 9.75C9.63065 9.75 9.91876 10.0381 9.91876 10.3912C9.91876 10.7444 9.63065 11.0325 9.27751 11.0325C8.92437 11.0325 8.63626 10.7444 8.63626 10.3912C8.63626 10.0381 8.92437 9.75 9.27751 9.75ZM10.6288 10.3912C10.6288 10.0381 10.9169 9.75 11.27 9.75C11.6232 9.75 11.9113 10.0381 11.9113 10.3912C11.9113 10.7444 11.6232 11.0325 11.27 11.0325C10.9169 11.0325 10.6288 10.7444 10.6288 10.3912ZM12.6825 9.75C13.0356 9.75 13.3238 10.0381 13.3238 10.3912C13.3238 10.7444 13.0356 11.0325 12.6825 11.0325C12.3294 11.0325 12.0413 10.7444 12.0413 10.3912C12.0413 10.0381 12.3294 9.75 12.6825 9.75ZM8.22999 2.25C8.45833 2.25 8.67326 2.33901 8.82138 2.49309L12.0017 5.87646C12.1499 6.03054 12.235 6.25376 12.235 6.49071V7.46786C12.235 7.94107 11.8582 8.32786 11.385 8.32786H3.075C2.6018 8.32786 2.225 7.94107 2.225 7.46786V6.49071C2.225 6.25376 2.31013 6.03054 2.45825 5.87646L5.6386 2.49309C5.78673 2.33901 6.00165 2.25 6.22999 2.25H8.22999ZM7.98863 3.25H6.47135L3.225 6.6955V7.32786H11.235V6.6955L7.98863 3.25Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
            
            <EditorContent editor={editor} className="border rounded-md p-3 min-h-[300px]" />
            
            <AnimatePresence>
              {selectedText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 border rounded-md bg-primary/5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Selected text:</p>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="gap-1.5"
                      onClick={convertSelectionToTask}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Convert to Task
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedText}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {potentialTasks && potentialTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 border rounded-md bg-primary/5 shadow-sm"
                >
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    <p className="text-sm font-medium">Potential tasks detected:</p>
                  </div>
                  <div className="space-y-2">
                    {potentialTasks.map((task, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between bg-background p-2 rounded-md"
                      >
                        <p className="text-sm">{task}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs"
                          onClick={() => createTaskFromSuggestion(task)}
                        >
                          Add as Task
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Loading editor...</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t py-2 px-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {lastSaved ? (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Autosaving enabled</span>
          )}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={forceSave}>
          <Save className="h-3.5 w-3.5" />
          Save Now
        </Button>
      </CardFooter>
    </Card>
  )
}