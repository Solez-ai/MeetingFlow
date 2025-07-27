// Comprehensive accessibility utilities
export interface AccessibilityOptions {
  announceToScreenReader?: boolean
  focusManagement?: boolean
  keyboardNavigation?: boolean
  highContrast?: boolean
}

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
    
    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  },
  
  // Save and restore focus
  saveFocus: () => {
    const activeElement = document.activeElement as HTMLElement
    return () => {
      if (activeElement && typeof activeElement.focus === 'function') {
        activeElement.focus()
      }
    }
  },
  
  // Focus first error in a form
  focusFirstError: (container: HTMLElement) => {
    const firstError = container.querySelector('[aria-invalid="true"], .error input, .error textarea, .error select') as HTMLElement
    if (firstError) {
      firstError.focus()
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  },
  
  // Manage focus for dynamic content
  manageDynamicFocus: (newContent: HTMLElement, previousFocus?: HTMLElement) => {
    const focusableElement = newContent.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement
    
    if (focusableElement) {
      focusableElement.focus()
    } else if (newContent.tabIndex >= 0) {
      newContent.focus()
    } else {
      // Make the container focusable and focus it
      newContent.tabIndex = -1
      newContent.focus()
    }
  }
}

// ARIA utilities
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'aria') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Set up ARIA relationships
  setupAriaRelationship: (trigger: HTMLElement, target: HTMLElement, relationship: 'describedby' | 'labelledby' | 'controls') => {
    const id = target.id || ariaUtils.generateId()
    target.id = id
    trigger.setAttribute(`aria-${relationship}`, id)
  },
  
  // Update ARIA live regions
  updateLiveRegion: (regionId: string, message: string, priority: 'polite' | 'assertive' = 'polite') => {
    let region = document.getElementById(regionId)
    
    if (!region) {
      region = document.createElement('div')
      region.id = regionId
      region.setAttribute('aria-live', priority)
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only'
      document.body.appendChild(region)
    }
    
    region.textContent = message
  },
  
  // Set up expandable content
  setupExpandable: (trigger: HTMLElement, content: HTMLElement, expanded = false) => {
    const contentId = content.id || ariaUtils.generateId('expandable')
    content.id = contentId
    
    trigger.setAttribute('aria-controls', contentId)
    trigger.setAttribute('aria-expanded', expanded.toString())
    content.setAttribute('aria-hidden', (!expanded).toString())
    
    return {
      expand: () => {
        trigger.setAttribute('aria-expanded', 'true')
        content.setAttribute('aria-hidden', 'false')
      },
      collapse: () => {
        trigger.setAttribute('aria-expanded', 'false')
        content.setAttribute('aria-hidden', 'true')
      },
      toggle: () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
        if (isExpanded) {
          trigger.setAttribute('aria-expanded', 'false')
          content.setAttribute('aria-hidden', 'true')
        } else {
          trigger.setAttribute('aria-expanded', 'true')
          content.setAttribute('aria-hidden', 'false')
        }
        return !isExpanded
      }
    }
  }
}

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Arrow key navigation for lists
  setupArrowNavigation: (container: HTMLElement, itemSelector: string) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[]
      const currentIndex = items.findIndex(item => item === document.activeElement)
      
      let nextIndex = currentIndex
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          break
        case 'ArrowUp':
          e.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = items.length - 1
          break
        default:
          return
      }
      
      items[nextIndex]?.focus()
    }
    
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  },
  
  // Tab panel navigation
  setupTabNavigation: (tabList: HTMLElement, panels: HTMLElement[]) => {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]')) as HTMLElement[]
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = tabs.findIndex(tab => tab === document.activeElement)
      let nextIndex = currentIndex
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
          break
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = tabs.length - 1
          break
        default:
          return
      }
      
      // Focus and activate the tab
      tabs[nextIndex]?.focus()
      tabs[nextIndex]?.click()
    }
    
    tabList.addEventListener('keydown', handleKeyDown)
    return () => tabList.removeEventListener('keydown', handleKeyDown)
  }
}

// Color contrast and visual accessibility
export const visualAccessibility = {
  // Check color contrast ratio
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
      const [r, g, b] = rgb.map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },
  
  // Check if contrast meets WCAG standards
  meetsContrastStandard: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = visualAccessibility.getContrastRatio(color1, color2)
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7
  },
  
  // Add high contrast mode support
  enableHighContrast: () => {
    document.documentElement.classList.add('high-contrast')
  },
  
  disableHighContrast: () => {
    document.documentElement.classList.remove('high-contrast')
  },
  
  // Detect user's contrast preference
  detectContrastPreference: (): 'normal' | 'high' | 'low' => {
    if (window.matchMedia('(prefers-contrast: high)').matches) return 'high'
    if (window.matchMedia('(prefers-contrast: low)').matches) return 'low'
    return 'normal'
  }
}

// Form accessibility utilities
export const formAccessibility = {
  // Set up form validation with ARIA
  setupFormValidation: (form: HTMLFormElement) => {
    const inputs = form.querySelectorAll('input, textarea, select') as NodeListOf<HTMLElement>
    
    inputs.forEach(input => {
      const errorId = `${input.id || ariaUtils.generateId()}-error`
      const errorElement = document.createElement('div')
      errorElement.id = errorId
      errorElement.className = 'sr-only error-message'
      errorElement.setAttribute('aria-live', 'polite')
      
      input.parentNode?.insertBefore(errorElement, input.nextSibling)
      input.setAttribute('aria-describedby', errorId)
      
      // Add validation listeners
      const validateInput = () => {
        const isValid = (input as HTMLInputElement).checkValidity()
        input.setAttribute('aria-invalid', (!isValid).toString())
        
        if (!isValid) {
          const validationMessage = (input as HTMLInputElement).validationMessage
          errorElement.textContent = validationMessage
          errorElement.className = 'error-message text-sm text-destructive mt-1'
        } else {
          errorElement.textContent = ''
          errorElement.className = 'sr-only error-message'
        }
      }
      
      input.addEventListener('blur', validateInput)
      input.addEventListener('invalid', validateInput)
    })
  },
  
  // Add required field indicators
  markRequiredFields: (form: HTMLFormElement) => {
    const requiredInputs = form.querySelectorAll('[required]') as NodeListOf<HTMLElement>
    
    requiredInputs.forEach(input => {
      const label = form.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement
      if (label && !label.querySelector('.required-indicator')) {
        const indicator = document.createElement('span')
        indicator.className = 'required-indicator text-destructive ml-1'
        indicator.textContent = '*'
        indicator.setAttribute('aria-label', 'required')
        label.appendChild(indicator)
      }
    })
  }
}

// Mobile accessibility utilities
export const mobileAccessibility = {
  // Optimize touch targets
  optimizeTouchTargets: (container: HTMLElement) => {
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea, [tabindex]') as NodeListOf<HTMLElement>
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        element.style.minWidth = '44px'
        element.style.minHeight = '44px'
        element.style.display = 'inline-flex'
        element.style.alignItems = 'center'
        element.style.justifyContent = 'center'
      }
    })
  },
  
  // Add swipe gesture support
  addSwipeSupport: (element: HTMLElement, callbacks: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
  }) => {
    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      const minSwipeDistance = 50
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            callbacks.onSwipeRight?.()
          } else {
            callbacks.onSwipeLeft?.()
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            callbacks.onSwipeDown?.()
          } else {
            callbacks.onSwipeUp?.()
          }
        }
      }
    }
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }
}

// Comprehensive accessibility checker
export const accessibilityChecker = {
  // Check common accessibility issues
  checkAccessibility: (container: HTMLElement = document.body): string[] => {
    const issues: string[] = []
    
    // Check for missing alt text on images
    const images = container.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`)
    }
    
    // Check for missing form labels
    const unlabeledInputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    const unlabeledInputsWithoutLabels = Array.from(unlabeledInputs).filter(input => {
      const id = input.getAttribute('id')
      return !id || !container.querySelector(`label[for="${id}"]`)
    })
    if (unlabeledInputsWithoutLabels.length > 0) {
      issues.push(`${unlabeledInputsWithoutLabels.length} form inputs missing labels`)
    }
    
    // Check for missing heading structure
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    if (headings.length === 0) {
      issues.push('No heading structure found')
    }
    
    // Check for missing focus indicators
    const focusableElements = container.querySelectorAll('button, a, input, select, textarea, [tabindex]')
    // This would require CSS analysis, so we'll skip for now
    
    // Check for missing ARIA labels on interactive elements
    const interactiveElements = container.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
    const unlabeledButtons = Array.from(interactiveElements).filter(button => {
      return !button.textContent?.trim()
    })
    if (unlabeledButtons.length > 0) {
      issues.push(`${unlabeledButtons.length} buttons missing accessible names`)
    }
    
    return issues
  },
  
  // Generate accessibility report
  generateReport: (container: HTMLElement = document.body) => {
    const issues = accessibilityChecker.checkAccessibility(container)
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      issues,
      recommendations: [
        'Add alt text to all images',
        'Ensure all form inputs have labels',
        'Use proper heading hierarchy',
        'Provide accessible names for interactive elements',
        'Test with keyboard navigation',
        'Test with screen reader'
      ]
    }
    
    console.group('🔍 Accessibility Report')
    console.log('Issues found:', issues.length)
    issues.forEach(issue => console.warn('⚠️', issue))
    console.log('Full report:', report)
    console.groupEnd()
    
    return report
  }
}