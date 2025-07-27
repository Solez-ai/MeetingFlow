// Micro-interactions for enhanced user experience
import { animationUtils } from './animations'

export interface MicroInteractionOptions {
  duration?: number
  easing?: string
  delay?: number
  hapticFeedback?: boolean
  soundFeedback?: boolean
}

// Button interaction effects
export const buttonInteractions = {
  // Ripple effect on click
  addRippleEffect: (button: HTMLElement, options: MicroInteractionOptions = {}) => {
    const handleClick = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple ${options.duration || 600}ms ease-out;
        pointer-events: none;
        z-index: 1;
      `
      
      // Ensure button has relative positioning
      if (getComputedStyle(button).position === 'static') {
        button.style.position = 'relative'
      }
      button.style.overflow = 'hidden'
      
      button.appendChild(ripple)
      
      setTimeout(() => {
        ripple.remove()
      }, options.duration || 600)
      
      // Add haptic feedback on mobile
      if (options.hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }
    
    button.addEventListener('click', handleClick)
    return () => button.removeEventListener('click', handleClick)
  },
  
  // Magnetic hover effect
  addMagneticEffect: (button: HTMLElement, strength = 0.3) => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength
      
      button.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    }
    
    const handleMouseLeave = () => {
      button.style.transform = 'translate(0, 0)'
    }
    
    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      button.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  },
  
  // Loading state animation
  addLoadingState: (button: HTMLElement, isLoading: boolean) => {
    if (isLoading) {
      const originalContent = button.innerHTML
      button.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Loading...
        </span>
      `
      button.disabled = true
      button.dataset.originalContent = originalContent
    } else {
      button.innerHTML = button.dataset.originalContent || button.innerHTML
      button.disabled = false
      delete button.dataset.originalContent
    }
  }
}

// Input field interactions
export const inputInteractions = {
  // Floating label animation
  addFloatingLabel: (input: HTMLInputElement, label: HTMLLabelElement) => {
    const updateLabel = () => {
      if (input.value || input === document.activeElement) {
        label.classList.add('floating')
      } else {
        label.classList.remove('floating')
      }
    }
    
    input.addEventListener('focus', updateLabel)
    input.addEventListener('blur', updateLabel)
    input.addEventListener('input', updateLabel)
    
    // Initial state
    updateLabel()
    
    return () => {
      input.removeEventListener('focus', updateLabel)
      input.removeEventListener('blur', updateLabel)
      input.removeEventListener('input', updateLabel)
    }
  },
  
  // Character count animation
  addCharacterCount: (input: HTMLInputElement | HTMLTextAreaElement, maxLength: number) => {
    const counter = document.createElement('div')
    counter.className = 'character-counter text-sm text-muted-foreground mt-1 transition-colors'
    input.parentNode?.appendChild(counter)
    
    const updateCounter = () => {
      const remaining = maxLength - input.value.length
      counter.textContent = `${remaining} characters remaining`
      
      if (remaining < 10) {
        counter.classList.add('text-destructive')
      } else {
        counter.classList.remove('text-destructive')
      }
      
      // Add shake animation when limit is reached
      if (remaining === 0) {
        counter.classList.add('animate-pulse')
      } else {
        counter.classList.remove('animate-pulse')
      }
    }
    
    input.addEventListener('input', updateCounter)
    updateCounter()
    
    return () => {
      input.removeEventListener('input', updateCounter)
      counter.remove()
    }
  },
  
  // Success/error state animations
  addValidationFeedback: (input: HTMLInputElement, isValid: boolean) => {
    const feedback = input.parentNode?.querySelector('.validation-feedback') as HTMLElement
    
    if (feedback) {
      if (isValid) {
        feedback.className = 'validation-feedback text-green-600 animate-in fade-in duration-200'
        feedback.textContent = '✓ Valid'
      } else {
        feedback.className = 'validation-feedback text-destructive animate-in fade-in duration-200'
        feedback.textContent = '✗ Invalid'
      }
    }
  }
}

// Card and container interactions
export const containerInteractions = {
  // Parallax scroll effect
  addParallaxEffect: (element: HTMLElement, speed = 0.5) => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const rate = scrolled * -speed
      element.style.transform = `translateY(${rate}px)`
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  },
  
  // Intersection observer animations
  addScrollReveal: (elements: NodeListOf<Element> | Element[], options: IntersectionObserverInit = {}) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-4', 'duration-500')
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    })
    
    elements.forEach(element => observer.observe(element))
    
    return () => observer.disconnect()
  },
  
  // Tilt effect on hover
  addTiltEffect: (element: HTMLElement, maxTilt = 15) => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const rotateX = ((e.clientY - centerY) / rect.height) * maxTilt
      const rotateY = ((centerX - e.clientX) / rect.width) * maxTilt
      
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }
    
    const handleMouseLeave = () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    }
    
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }
}

// Navigation interactions
export const navigationInteractions = {
  // Smooth page transitions
  addPageTransition: (duration = 300) => {
    const overlay = document.createElement('div')
    overlay.className = 'page-transition-overlay fixed inset-0 bg-background z-50 opacity-0 pointer-events-none transition-opacity'
    document.body.appendChild(overlay)
    
    const startTransition = () => {
      overlay.style.pointerEvents = 'auto'
      overlay.style.opacity = '1'
      
      setTimeout(() => {
        overlay.style.opacity = '0'
        setTimeout(() => {
          overlay.style.pointerEvents = 'none'
        }, duration)
      }, duration / 2)
    }
    
    return { startTransition, cleanup: () => overlay.remove() }
  },
  
  // Active link highlighting
  addActiveLinkHighlight: (nav: HTMLElement) => {
    const links = nav.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>
    const indicator = document.createElement('div')
    indicator.className = 'nav-indicator absolute bg-primary h-0.5 transition-all duration-300 ease-out'
    nav.appendChild(indicator)
    
    const updateIndicator = (activeLink: HTMLAnchorElement) => {
      const rect = activeLink.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      
      indicator.style.left = `${rect.left - navRect.left}px`
      indicator.style.width = `${rect.width}px`
    }
    
    // Find active link and update indicator
    const activeLink = nav.querySelector('a[aria-current="page"]') as HTMLAnchorElement
    if (activeLink) {
      updateIndicator(activeLink)
    }
    
    // Add hover effects
    links.forEach(link => {
      link.addEventListener('mouseenter', () => updateIndicator(link))
      link.addEventListener('mouseleave', () => {
        const currentActive = nav.querySelector('a[aria-current="page"]') as HTMLAnchorElement
        if (currentActive) {
          updateIndicator(currentActive)
        }
      })
    })
    
    return () => indicator.remove()
  }
}

// Toast and notification interactions
export const notificationInteractions = {
  // Slide in toast notifications
  addToastAnimation: (toast: HTMLElement, position: 'top' | 'bottom' | 'left' | 'right' = 'top') => {
    const slideClasses = {
      top: 'animate-in slide-in-from-top duration-300',
      bottom: 'animate-in slide-in-from-bottom duration-300',
      left: 'animate-in slide-in-from-left duration-300',
      right: 'animate-in slide-in-from-right duration-300'
    }
    
    toast.className += ` ${slideClasses[position]}`
    
    // Auto-remove animation
    const removeToast = () => {
      const exitClasses = {
        top: 'animate-out slide-out-to-top duration-200',
        bottom: 'animate-out slide-out-to-bottom duration-200',
        left: 'animate-out slide-out-to-left duration-200',
        right: 'animate-out slide-out-to-right duration-200'
      }
      
      toast.className = toast.className.replace(slideClasses[position], exitClasses[position])
      
      setTimeout(() => {
        toast.remove()
      }, 200)
    }
    
    return removeToast
  },
  
  // Progress bar animation
  addProgressAnimation: (progressBar: HTMLElement, duration: number) => {
    progressBar.style.width = '0%'
    progressBar.style.transition = `width ${duration}ms linear`
    
    // Start animation
    requestAnimationFrame(() => {
      progressBar.style.width = '100%'
    })
    
    return () => {
      progressBar.style.width = '0%'
    }
  }
}

// Drag and drop interactions
export const dragDropInteractions = {
  // Add drag preview
  addDragPreview: (element: HTMLElement, previewContent?: string) => {
    const handleDragStart = (e: DragEvent) => {
      // Create custom drag image
      const dragImage = document.createElement('div')
      dragImage.innerHTML = previewContent || element.innerHTML
      dragImage.className = 'drag-preview bg-background border border-border rounded-lg p-2 shadow-lg opacity-90'
      dragImage.style.position = 'absolute'
      dragImage.style.top = '-1000px'
      document.body.appendChild(dragImage)
      
      e.dataTransfer?.setDragImage(dragImage, 0, 0)
      
      setTimeout(() => {
        document.body.removeChild(dragImage)
      }, 0)
      
      // Add dragging class to original element
      element.classList.add('dragging', 'opacity-50')
    }
    
    const handleDragEnd = () => {
      element.classList.remove('dragging', 'opacity-50')
    }
    
    element.addEventListener('dragstart', handleDragStart)
    element.addEventListener('dragend', handleDragEnd)
    
    return () => {
      element.removeEventListener('dragstart', handleDragStart)
      element.removeEventListener('dragend', handleDragEnd)
    }
  },
  
  // Add drop zone highlighting
  addDropZoneHighlight: (dropZone: HTMLElement) => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      dropZone.classList.add('drag-over', 'border-primary', 'bg-primary/5')
    }
    
    const handleDragLeave = () => {
      dropZone.classList.remove('drag-over', 'border-primary', 'bg-primary/5')
    }
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      dropZone.classList.remove('drag-over', 'border-primary', 'bg-primary/5')
      dropZone.classList.add('animate-pulse')
      
      setTimeout(() => {
        dropZone.classList.remove('animate-pulse')
      }, 500)
    }
    
    dropZone.addEventListener('dragover', handleDragOver)
    dropZone.addEventListener('dragleave', handleDragLeave)
    dropZone.addEventListener('drop', handleDrop)
    
    return () => {
      dropZone.removeEventListener('dragover', handleDragOver)
      dropZone.removeEventListener('dragleave', handleDragLeave)
      dropZone.removeEventListener('drop', handleDrop)
    }
  }
}

// Initialize CSS for micro-interactions
export const initializeMicroInteractions = () => {
  if (typeof document === 'undefined') return
  
  const style = document.createElement('style')
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .floating {
      transform: translateY(-20px) scale(0.8);
      color: hsl(var(--primary));
    }
    
    .drag-preview {
      font-family: inherit;
      font-size: 14px;
      max-width: 200px;
    }
    
    .dragging {
      cursor: grabbing !important;
    }
    
    .drag-over {
      transition: all 0.2s ease;
    }
    
    .nav-indicator {
      bottom: -1px;
    }
    
    .page-transition-overlay {
      transition: opacity 0.3s ease-in-out;
    }
    
    /* Keyboard navigation styles */
    .keyboard-navigation *:focus {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
    }
    
    .mouse-navigation *:focus {
      outline: none;
    }
    
    /* High contrast mode */
    .high-contrast {
      filter: contrast(150%);
    }
    
    .high-contrast * {
      border-color: currentColor !important;
    }
  `
  
  document.head.appendChild(style)
}

// Utility to apply multiple micro-interactions
export const applyMicroInteractions = (element: HTMLElement, interactions: string[]) => {
  const cleanupFunctions: (() => void)[] = []
  
  interactions.forEach(interaction => {
    switch (interaction) {
      case 'ripple':
        if (element.tagName === 'BUTTON') {
          cleanupFunctions.push(buttonInteractions.addRippleEffect(element))
        }
        break
      case 'magnetic':
        if (element.tagName === 'BUTTON') {
          cleanupFunctions.push(buttonInteractions.addMagneticEffect(element))
        }
        break
      case 'tilt':
        cleanupFunctions.push(containerInteractions.addTiltEffect(element))
        break
      case 'parallax':
        cleanupFunctions.push(containerInteractions.addParallaxEffect(element))
        break
      case 'scroll-reveal':
        cleanupFunctions.push(containerInteractions.addScrollReveal([element]))
        break
    }
  })
  
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup())
  }
}