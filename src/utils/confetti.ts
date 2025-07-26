/**
 * Confetti utility for task completion celebrations
 */

// Default confetti colors
const CONFETTI_COLORS = [
  '#4f46e5', // Primary (indigo)
  '#22c55e', // Success (green)
  '#facc15', // Warning (yellow)
  '#f97316', // Orange
  '#ec4899', // Pink
]

// Confetti particle interface
interface ConfettiParticle {
  x: number
  y: number
  radius: number
  color: string
  velocity: {
    x: number
    y: number
  }
  rotation: number
  rotationSpeed: number
  opacity: number
  lifetime: number
  maxLifetime: number
}

/**
 * Create a confetti particle
 */
function createParticle(x: number, y: number): ConfettiParticle {
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] || '#4f46e5'
  
  return {
    x,
    y,
    radius: Math.random() * 3 + 2,
    color,
    velocity: {
      x: Math.random() * 6 - 3,
      y: Math.random() * -3 - 3
    },
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 10 - 5,
    opacity: 1,
    lifetime: 0,
    maxLifetime: Math.random() * 100 + 50
  }
}

/**
 * Show confetti animation
 * @param x X position (default: center of screen)
 * @param y Y position (default: center of screen)
 * @param particleCount Number of particles (default: 50)
 * @param intensity Low, medium, or high (default: medium)
 */
export function showConfetti(
  x?: number, 
  y?: number, 
  intensity: 'low' | 'medium' | 'high' = 'medium'
): void {
  // Create canvas element
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)
  
  // Set canvas size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  // Get context
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    document.body.removeChild(canvas)
    return
  }
  
  // Set default position to center of screen if not provided
  const posX = x ?? canvas.width / 2
  const posY = y ?? canvas.height / 2
  
  // Determine particle count based on intensity
  let particleCount = 50
  switch (intensity) {
    case 'low':
      particleCount = 20
      break
    case 'medium':
      particleCount = 50
      break
    case 'high':
      particleCount = 100
      break
  }
  
  // Create particles
  const particles: ConfettiParticle[] = []
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(posX, posY))
  }
  
  // Animation function
  function animate() {
    // Clear canvas
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Update and draw particles
    let allDead = true
    
    particles.forEach(particle => {
      // Update position
      particle.x += particle.velocity.x
      particle.y += particle.velocity.y
      
      // Apply gravity
      particle.velocity.y += 0.1
      
      // Update rotation
      particle.rotation += particle.rotationSpeed
      
      // Update lifetime
      particle.lifetime++
      
      // Update opacity based on lifetime
      particle.opacity = 1 - (particle.lifetime / particle.maxLifetime)
      
      // Check if particle is still alive
      if (particle.opacity > 0) {
        allDead = false
        
        // Draw particle
        if (ctx) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate(particle.rotation * Math.PI / 180)
          ctx.globalAlpha = particle.opacity
          ctx.fillStyle = particle.color
          
          // Draw a rectangle for confetti
          ctx.fillRect(-particle.radius, -particle.radius / 2, particle.radius * 2, particle.radius)
          
          ctx.restore()
        }
      }
    })
    
    // Continue animation if particles are still alive
    if (allDead) {
      document.body.removeChild(canvas)
    } else {
      requestAnimationFrame(animate)
    }
  }
  
  // Start animation
  animate()
}

/**
 * Initialize confetti event listener
 */
export function initConfetti(): void {
  window.addEventListener('confetti', (event: Event) => {
    const customEvent = event as CustomEvent
    const options = customEvent.detail || {}
    
    showConfetti(
      options.x,
      options.y,
      options.intensity || 'medium'
    )
  })
}