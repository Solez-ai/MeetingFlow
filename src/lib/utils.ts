import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import { APP_CONFIG } from "./constants"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as "Jan 1, 2025"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

/**
 * Format a time as "1:30 PM"
 */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

/**
 * Format a date and time as "Jan 1, 2025 at 1:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

/**
 * Generate a unique ID using UUID v4
 */
export function generateId(): string {
  return uuidv4()
}

/**
 * Format a duration in minutes to a human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  
  return `${hours} hr ${remainingMinutes} min`
}

/**
 * Calculate time slots for agenda items based on total meeting duration
 */
export function calculateTimeSlots(
  totalDuration: number,
  topics: string[],
): { title: string; duration: number }[] {
  if (!topics.length) return []
  
  // Reserve time for wrap-up
  const availableDuration = totalDuration - APP_CONFIG.WRAP_UP_TIME
  
  // Calculate base duration per topic
  const baseDurationPerTopic = Math.floor(availableDuration / topics.length)
  
  // Calculate remaining minutes to distribute
  const remainingMinutes = availableDuration - (baseDurationPerTopic * topics.length)
  
  // Create time slots
  const timeSlots = topics.map((title, index) => ({
    title,
    // Add an extra minute to earlier topics if there are remaining minutes
    duration: baseDurationPerTopic + (index < remainingMinutes ? 1 : 0),
  }))
  
  // Add wrap-up item
  timeSlots.push({
    title: 'Wrap-up and Next Steps',
    duration: APP_CONFIG.WRAP_UP_TIME,
  })
  
  return timeSlots
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
  }
}

/**
 * Convert a string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Extract action items from text using common patterns
 */
export function extractActionItems(text: string): string[] {
  const actionPatterns = [
    /\b(action item|todo|task)[:;]\s*([^.!?\n]+)/gi,
    /\b([a-z]+) (will|should|needs to|has to|must) ([^.!?\n]+)/gi,
    /\b(let's|we should|we need to) ([^.!?\n]+)/gi,
  ]
  
  const actionItems: string[] = []
  
  actionPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      // Extract the action part based on the pattern
      const actionText = match[2] || match[3] || match[1]
      if (actionText && actionText.trim().length > 3) {
        actionItems.push(actionText.trim())
      }
    }
  })
  
  return [...new Set(actionItems)] // Remove duplicates
}