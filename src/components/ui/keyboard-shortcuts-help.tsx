import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Button } from './button'
import { Badge } from './badge'
import { Separator } from './separator'
import { HelpCircleIcon, KeyboardIcon } from 'lucide-react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface ShortcutGroup {
  category: string
  shortcuts: Array<{
    key: string
    description: string
    modifiers?: string[]
  }>
}

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const { shortcuts } = useKeyboardShortcuts()

  // Group shortcuts by category
  const shortcutGroups: ShortcutGroup[] = [
    {
      category: 'Navigation',
      shortcuts: [
        { key: 'H', modifiers: ['Ctrl'], description: 'Go to Dashboard' },
        { key: 'N', modifiers: ['Ctrl'], description: 'New Meeting' },
        { key: 'S', modifiers: ['Ctrl'], description: 'Open Settings' },
        { key: 'T', modifiers: ['Ctrl'], description: 'View Action Items' },
      ]
    },
    {
      category: 'Meeting',
      shortcuts: [
        { key: 'S', modifiers: ['Ctrl', 'Shift'], description: 'Save Current Meeting' },
        { key: 'E', modifiers: ['Ctrl'], description: 'Export Data' },
      ]
    },
    {
      category: 'Voice Commands',
      shortcuts: [
        { key: 'V', modifiers: ['Ctrl', 'Shift'], description: 'Toggle Voice Commands' },
      ]
    },
    {
      category: 'Accessibility',
      shortcuts: [
        { key: '?', description: 'Show Keyboard Shortcuts' },
        { key: 'F', modifiers: ['Ctrl'], description: 'Focus Search' },
        { key: 'Tab', description: 'Navigate between elements' },
        { key: 'Escape', description: 'Close dialogs/modals' },
        { key: 'Enter', description: 'Activate focused element' },
        { key: 'Space', description: 'Activate buttons/checkboxes' },
      ]
    },
    {
      category: 'List Navigation',
      shortcuts: [
        { key: '↑/↓', description: 'Navigate list items' },
        { key: 'Home', description: 'Go to first item' },
        { key: 'End', description: 'Go to last item' },
      ]
    }
  ]

  // Listen for ? key to open help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const target = e.target as HTMLElement
        const isInInputField = target.tagName === 'INPUT' || 
                              target.tagName === 'TEXTAREA' || 
                              target.contentEditable === 'true'
        
        if (!isInInputField) {
          e.preventDefault()
          setIsOpen(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const formatModifiers = (modifiers: string[] = []) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    return modifiers.map(mod => {
      switch (mod) {
        case 'Ctrl':
          return isMac ? '⌘' : 'Ctrl'
        case 'Shift':
          return '⇧'
        case 'Alt':
          return isMac ? '⌥' : 'Alt'
        default:
          return mod
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 focus-ring"
          aria-label="Show keyboard shortcuts"
        >
          <KeyboardIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyboardIcon className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div id="keyboard-shortcuts-description" className="text-sm text-muted-foreground mb-4">
          Use these keyboard shortcuts to navigate MeetingFlow more efficiently.
        </div>

        <div className="space-y-6">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={group.category}>
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                {group.category}
              </h3>
              
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div 
                    key={`${group.category}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {formatModifiers(shortcut.modifiers).map((modifier, modIndex) => (
                        <Badge 
                          key={modIndex}
                          variant="outline" 
                          className="text-xs px-2 py-1 font-mono"
                        >
                          {modifier}
                        </Badge>
                      ))}
                      {shortcut.modifiers && shortcut.modifiers.length > 0 && (
                        <span className="text-muted-foreground mx-1">+</span>
                      )}
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-1 font-mono"
                      >
                        {shortcut.key}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {groupIndex < shortcutGroups.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <HelpCircleIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">?</kbd> anytime to open this help</li>
                <li>• Use <kbd className="px-1 py-0.5 bg-background rounded text-xs">Tab</kbd> to navigate between interactive elements</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Escape</kbd> to close dialogs and menus</li>
                <li>• Voice commands can be activated with <kbd className="px-1 py-0.5 bg-background rounded text-xs">Ctrl+Shift+V</kbd></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={() => setIsOpen(false)}
            className="focus-ring"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Floating keyboard shortcut indicator
export function KeyboardShortcutIndicator() {
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      // Show indicator when user starts using keyboard navigation
      if (e.key === 'Tab' || (e.ctrlKey && e.key !== 'Control')) {
        setShowIndicator(true)
        
        // Hide after 3 seconds of inactivity
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setShowIndicator(false)
        }, 3000)
      }
    }

    const handleMouseMove = () => {
      // Hide indicator when user switches to mouse
      setShowIndicator(false)
      clearTimeout(timeoutId)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeoutId)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in fade-in slide-in-from-left duration-300">
      <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <KeyboardIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">?</kbd> for shortcuts
          </span>
        </div>
      </div>
    </div>
  )
}