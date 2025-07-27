// Animation utilities for enhanced user experience
export const animations = {
  // Entrance animations
  fadeIn: 'animate-in fade-in duration-300',
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',
  scaleIn: 'animate-in zoom-in duration-200',
  
  // Exit animations
  fadeOut: 'animate-out fade-out duration-200',
  slideOutToTop: 'animate-out slide-out-to-top duration-200',
  slideOutToBottom: 'animate-out slide-out-to-bottom duration-200',
  slideOutToLeft: 'animate-out slide-out-to-left duration-200',
  slideOutToRight: 'animate-out slide-out-to-right duration-200',
  scaleOut: 'animate-out zoom-out duration-200',
  
  // Hover effects
  hoverScale: 'transition-transform hover:scale-105 active:scale-95',
  hoverLift: 'transition-all hover:shadow-lg hover:-translate-y-1',
  hoverGlow: 'transition-all hover:shadow-md hover:shadow-primary/25',
  
  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  
  // Micro-interactions
  buttonPress: 'transition-all active:scale-95 active:brightness-95',
  cardHover: 'transition-all hover:shadow-md hover:border-primary/20',
  inputFocus: 'transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary',
  
  // Mobile-optimized animations
  mobileSlideIn: 'animate-in slide-in-from-bottom duration-200 sm:slide-in-from-right sm:duration-300',
  mobileFadeIn: 'animate-in fade-in duration-200 sm:duration-300',
}

// Animation presets for common UI patterns
export const animationPresets = {
  modal: {
    overlay: 'animate-in fade-in duration-200',
    content: 'animate-in fade-in zoom-in-95 duration-200',
  },
  dropdown: {
    content: 'animate-in fade-in slide-in-from-top-2 duration-150',
  },
  toast: {
    enter: 'animate-in slide-in-from-right duration-300',
    exit: 'animate-out slide-out-to-right duration-200',
  },
  sidebar: {
    enter: 'animate-in slide-in-from-left duration-300',
    exit: 'animate-out slide-out-to-left duration-200',
  },
  tab: {
    enter: 'animate-in fade-in slide-in-from-bottom-2 duration-200',
    exit: 'animate-out fade-out slide-out-to-bottom-2 duration-150',
  },
}

// Stagger animations for lists
export const staggerAnimation = (index: number, baseDelay = 50) => ({
  style: {
    animationDelay: `${index * baseDelay}ms`,
  },
  className: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
})

// Reduced motion support
export const respectsReducedMotion = (animation: string) => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'transition-none'
  }
  return animation
}

// Spring animation configurations
export const springConfigs = {
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
  molasses: { tension: 280, friction: 120 },
}

// Gesture animations for mobile
export const gestureAnimations = {
  swipeLeft: 'animate-out slide-out-to-left duration-200',
  swipeRight: 'animate-out slide-out-to-right duration-200',
  swipeUp: 'animate-out slide-out-to-top duration-200',
  swipeDown: 'animate-out slide-out-to-bottom duration-200',
}

// Performance-optimized animations
export const performantAnimations = {
  // Use transform and opacity for best performance
  slideUp: 'transform transition-transform duration-300 ease-out translate-y-0',
  slideDown: 'transform transition-transform duration-300 ease-out translate-y-full',
  fadeInOut: 'opacity transition-opacity duration-300 ease-in-out',
}

// Animation utilities
export const animationUtils = {
  // Add animation class with automatic cleanup
  addTemporaryAnimation: (element: HTMLElement, animationClass: string, duration = 300) => {
    element.classList.add(animationClass)
    setTimeout(() => {
      element.classList.remove(animationClass)
    }, duration)
  },
  
  // Check if animations are enabled
  areAnimationsEnabled: () => {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  // Create staggered entrance for multiple elements
  staggerElements: (elements: NodeListOf<Element> | Element[], baseDelay = 100) => {
    elements.forEach((element, index) => {
      if (element instanceof HTMLElement) {
        element.style.animationDelay = `${index * baseDelay}ms`
        element.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-4', 'duration-300')
      }
    })
  },
  
  // Smooth scroll with animation
  smoothScrollTo: (element: Element, options?: ScrollIntoViewOptions) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options,
    })
  },
}

// CSS-in-JS animations for complex scenarios
export const keyframeAnimations = {
  wiggle: `
    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    .animate-wiggle {
      animation: wiggle 0.5s ease-in-out;
    }
  `,
  
  heartbeat: `
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .animate-heartbeat {
      animation: heartbeat 1s ease-in-out infinite;
    }
  `,
  
  typewriter: `
    @keyframes typewriter {
      from { width: 0; }
      to { width: 100%; }
    }
    .animate-typewriter {
      animation: typewriter 2s steps(40, end);
      overflow: hidden;
      white-space: nowrap;
      border-right: 2px solid;
    }
  `,
}

// Inject keyframe animations into the document
export const injectKeyframeAnimations = () => {
  if (typeof document === 'undefined') return
  
  const styleElement = document.createElement('style')
  styleElement.textContent = Object.values(keyframeAnimations).join('\n')
  document.head.appendChild(styleElement)
}