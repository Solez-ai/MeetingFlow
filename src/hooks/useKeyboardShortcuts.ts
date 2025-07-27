import { useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useVoiceCommandContext } from '@/components/voice/VoiceCommandProvider'
import { useMeetingStore } from '@/store/meetingStore'
import { useToast } from '@/hooks/use-toast'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  category: string
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleListening, isSupported } = useVoiceCommandContext()
  const { currentMeeting, createMeeting, saveMeeting } = useMeetingStore()
  const { toast } = useToast()

  const showShortcutHelp = useCallback(() => {
    toast({
      title: "Keyboard Shortcuts",
      description: "Press ? to see all available shortcuts",
      duration: 3000,
    })
  }, [toast])

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => navigate('/meeting/new'),
      description: 'New Meeting',
      category: 'Navigation'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => navigate('/settings'),
      description: 'Open Settings',
      category: 'Navigation'
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => navigate('/action-items'),
      description: 'View Action Items',
      category: 'Navigation'
    },
    
    // Meeting shortcuts
    {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        if (currentMeeting) {
          saveMeeting()
          toast({
            title: "Meeting Saved",
            description: "Your meeting has been saved successfully",
            duration: 2000,
          })
        }
      },
      description: 'Save Current Meeting',
      category: 'Meeting'
    },
    
    // Voice command shortcuts
    {
      key: 'v',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        if (isSupported) {
          toggleListening()
        } else {
          toast({
            title: "Voice Commands Unavailable",
            description: "Your browser doesn't support voice recognition",
            variant: "destructive",
            duration: 3000,
          })
        }
      },
      description: 'Toggle Voice Commands',
      category: 'Voice'
    },
    
    // Accessibility shortcuts
    {
      key: '?',
      action: showShortcutHelp,
      description: 'Show Keyboard Shortcuts',
      category: 'Help'
    },
    
    // Focus management
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      },
      description: 'Focus Search',
      category: 'Focus'
    },
    
    // Quick actions
    {
      key: 'e',
      ctrlKey: true,
      action: () => {
        // Trigger export dialog
        const exportButton = document.querySelector('[data-export-trigger]') as HTMLButtonElement
        if (exportButton) {
          exportButton.click()
        } else {
          toast({
            title: "Export",
            description: "Export functionality not available on this page",
            duration: 2000,
          })
        }
      },
      description: 'Export Data',
      category: 'Actions'
    }
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = event.target as HTMLElement
      const isInInputField = target.tagName === 'INPUT' || 
                            target.tagName === 'TEXTAREA' || 
                            target.contentEditable === 'true' ||
                            target.closest('[contenteditable="true"]')

      // Allow certain shortcuts even in input fields
      const allowInInputFields = ['s'] // Save shortcut
      const currentKey = event.key.toLowerCase()
      
      if (isInInputField && !allowInInputFields.includes(currentKey)) {
        return
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === currentKey
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey
        const metaMatch = !!shortcut.metaKey === event.metaKey
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey
        const altMatch = !!shortcut.altKey === event.altKey
        
        return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch
      })

      if (matchingShortcut) {
        event.preventDefault()
        event.stopPropagation()
        matchingShortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, navigate, currentMeeting, saveMeeting, toggleListening, isSupported, toast, showShortcutHelp])

  return { shortcuts }
}

// Hook for focus management and tab navigation
export function useFocusManagement() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to close modals/dialogs
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"][data-state="open"]')
        if (activeModal) {
          const closeButton = activeModal.querySelector('[data-close-modal]') as HTMLButtonElement
          if (closeButton) {
            closeButton.click()
          }
        }
      }
      
      // Tab navigation enhancement
      if (event.key === 'Tab') {
        // Add visual focus indicators
        document.body.classList.add('keyboard-navigation')
        
        // Remove mouse navigation class
        document.body.classList.remove('mouse-navigation')
      }
    }

    const handleMouseDown = () => {
      document.body.classList.add('mouse-navigation')
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
}

// Hook for skip links and accessibility navigation
export function useAccessibilityNavigation() {
  useEffect(() => {
    // Create skip links if they don't exist
    const existingSkipLinks = document.querySelector('#skip-links')
    if (!existingSkipLinks) {
      const skipLinks = document.createElement('div')
      skipLinks.id = 'skip-links'
      skipLinks.className = 'sr-only focus-within:not-sr-only fixed top-0 left-0 z-[9999] bg-background border border-border p-2 rounded-br-md'
      skipLinks.innerHTML = `
        <a href="#main-content" class="block p-2 text-sm font-medium text-foreground hover:bg-accent rounded focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to main content
        </a>
        <a href="#navigation" class="block p-2 text-sm font-medium text-foreground hover:bg-accent rounded focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to navigation
        </a>
      `
      document.body.insertBefore(skipLinks, document.body.firstChild)
    }

    // Add main content landmark if it doesn't exist
    const mainContent = document.querySelector('main')
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content'
      mainContent.setAttribute('tabindex', '-1')
    }

    // Add navigation landmark
    const navigation = document.querySelector('nav')
    if (navigation && !navigation.id) {
      navigation.id = 'navigation'
    }
  }, [])
}

// Combined hook for all keyboard functionality
export function useComprehensiveKeyboardSupport() {
  useKeyboardShortcuts()
  useFocusManagement()
  useAccessibilityNavigation()
}