/**
 * Storage utility for localStorage operations
 * 
 * This module provides type-safe access to localStorage with
 * error handling, validation, automatic JSON parsing/stringifying,
 * and performance optimizations including batching and caching.
 */

import { validateMeeting } from './validation'
import { Meeting } from '@/types'
import { debounce, throttle } from './performance'

// Storage keys
export const STORAGE_KEYS = {
  APP_STATE: 'meetingflow:app-state',
  MEETINGS: 'meetingflow:meetings',
  CURRENT_MEETING: 'meetingflow:current-meeting',
  SETTINGS: 'meetingflow:settings',
}

// Storage error types
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'quota_exceeded',
  VALIDATION_FAILED = 'validation_failed',
  PARSE_ERROR = 'parse_error',
  WRITE_ERROR = 'write_error',
  READ_ERROR = 'read_error',
  UNAVAILABLE = 'unavailable',
}

// Storage error class
export class StorageError extends Error {
  type: StorageErrorType
  key: string
  
  constructor(type: StorageErrorType, key: string, message: string) {
    super(message)
    this.name = 'StorageError'
    this.type = type
    this.key = key
  }
}

/**
 * Save data to localStorage with error handling and validation
 */
export function saveToStorage<T>(key: string, data: T, validate = false): boolean {
  try {
    // Check if storage is available
    if (!isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        key,
        'localStorage is not available'
      )
    }
    
    // Validate meeting data if requested
    if (validate && key === STORAGE_KEYS.CURRENT_MEETING) {
      const validationResult = validateMeeting(data)
      if (!validationResult.valid) {
        throw new StorageError(
          StorageErrorType.VALIDATION_FAILED,
          key,
          `Meeting validation failed: ${validationResult.errors.join(', ')}`
        )
      }
    }
    
    // Try to save data
    const serialized = JSON.stringify(data)
    localStorage.setItem(key, serialized)
    
    return true
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`Storage quota exceeded for key (${key})`)
      
      // Dispatch custom event for UI notification
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: {
          type: StorageErrorType.QUOTA_EXCEEDED,
          key,
          message: 'Storage quota exceeded. Try removing some data.'
        }
      }))
      
      return false
    }
    
    // Handle our custom storage errors
    if (error instanceof StorageError) {
      console.error(`Storage error for key (${key}):`, error.message)
      
      // Dispatch custom event for UI notification
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: {
          type: error.type,
          key: error.key,
          message: error.message
        }
      }))
      
      return false
    }
    
    // Handle other errors
    console.error(`Error saving to localStorage (${key}):`, error)
    
    // Dispatch generic error event
    window.dispatchEvent(new CustomEvent('storage-error', {
      detail: {
        type: StorageErrorType.WRITE_ERROR,
        key,
        message: `Failed to save data to storage: ${(error as Error).message}`
      }
    }))
    
    return false
  }
}

/**
 * Load data from localStorage with error handling and validation
 */
export function loadFromStorage<T>(key: string, defaultValue: T, validate = false): T {
  try {
    // Check if storage is available
    if (!isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        key,
        'localStorage is not available'
      )
    }
    
    const item = localStorage.getItem(key)
    
    // Return default if item doesn't exist
    if (!item) {
      return defaultValue
    }
    
    // Parse the data
    const parsedData = JSON.parse(item) as T
    
    // Validate meeting data if requested
    if (validate && key === STORAGE_KEYS.CURRENT_MEETING) {
      const validationResult = validateMeeting(parsedData)
      if (!validationResult.valid) {
        console.warn(`Loaded invalid meeting data: ${validationResult.errors.join(', ')}`)
        
        // Create backup of invalid data
        const backupKey = `${key}_backup_${Date.now()}`
        localStorage.setItem(backupKey, item)
        
        console.info(`Backed up invalid data to ${backupKey}`)
        
        // Dispatch validation warning event
        window.dispatchEvent(new CustomEvent('storage-warning', {
          detail: {
            type: StorageErrorType.VALIDATION_FAILED,
            key,
            message: `Meeting data validation failed. Using default data instead. Backup created at ${backupKey}.`
          }
        }))
        
        return defaultValue
      }
    }
    
    return parsedData
  } catch (error) {
    // Handle parse errors
    if (error instanceof SyntaxError) {
      console.error(`Parse error for localStorage key (${key}):`, error)
      
      // Create backup of invalid data
      const invalidData = localStorage.getItem(key)
      if (invalidData) {
        const backupKey = `${key}_corrupt_${Date.now()}`
        localStorage.setItem(backupKey, invalidData)
        console.info(`Backed up corrupt data to ${backupKey}`)
      }
      
      // Dispatch custom event for UI notification
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: {
          type: StorageErrorType.PARSE_ERROR,
          key,
          message: `Failed to parse stored data. Using default data instead.`
        }
      }))
      
      return defaultValue
    }
    
    // Handle our custom storage errors
    if (error instanceof StorageError) {
      console.error(`Storage error for key (${key}):`, error.message)
      
      // Dispatch custom event for UI notification
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: {
          type: error.type,
          key: error.key,
          message: error.message
        }
      }))
      
      return defaultValue
    }
    
    // Handle other errors
    console.error(`Error loading from localStorage (${key}):`, error)
    
    // Dispatch generic error event
    window.dispatchEvent(new CustomEvent('storage-error', {
      detail: {
        type: StorageErrorType.READ_ERROR,
        key,
        message: `Failed to load data from storage: ${(error as Error).message}`
      }
    }))
    
    return defaultValue
  }
}

/**
 * Remove data from localStorage with error handling
 */
export function removeFromStorage(key: string): boolean {
  try {
    // Check if storage is available
    if (!isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        key,
        'localStorage is not available'
      )
    }
    
    localStorage.removeItem(key)
    return true
  } catch (error) {
    // Handle our custom storage errors
    if (error instanceof StorageError) {
      console.error(`Storage error for key (${key}):`, error.message)
      
      // Dispatch custom event for UI notification
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: {
          type: error.type,
          key: error.key,
          message: error.message
        }
      }))
      
      return false
    }
    
    // Handle other errors
    console.error(`Error removing from localStorage (${key}):`, error)
    
    // Dispatch generic error event
    window.dispatchEvent(new CustomEvent('storage-error', {
      detail: {
        type: StorageErrorType.WRITE_ERROR,
        key,
        message: `Failed to remove data from storage: ${(error as Error).message}`
      }
    }))
    
    return false
  }
}

/**
 * Clear all app-related data from localStorage
 */
export function clearAppStorage(): boolean {
  try {
    // Check if storage is available
    if (!isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        'all',
        'localStorage is not available'
      )
    }
    
    // Get all keys that start with our app prefix
    const appKeys = Object.keys(localStorage).filter(key => key.startsWith('meetingflow:'))
    
    // Remove each key
    appKeys.forEach(key => localStorage.removeItem(key))
    
    return true
  } catch (error) {
    // Handle our custom storage errors
    if (error instanceof StorageError) {
      console.error('Storage error when clearing app storage:', error.message)
      
      // Dispatch custom event for UI notification
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: {
          type: error.type,
          key: 'all',
          message: error.message
        }
      }))
      
      return false
    }
    
    // Handle other errors
    console.error('Error clearing app storage:', error)
    
    // Dispatch generic error event
    window.dispatchEvent(new CustomEvent('storage-error', {
      detail: {
        type: StorageErrorType.WRITE_ERROR,
        key: 'all',
        message: `Failed to clear app storage: ${(error as Error).message}`
      }
    }))
    
    return false
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Get the total size of data stored in localStorage
 */
export function getStorageSize(): number {
  try {
    let totalSize = 0
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ''
        totalSize += key.length + value.length
      }
    }
    
    // Return size in KB
    return Math.round(totalSize / 1024)
  } catch (error) {
    console.error('Error calculating storage size:', error)
    return 0
  }
}

/**
 * Save a meeting to localStorage
 */
export function saveMeeting(meeting: Meeting): boolean {
  // First validate the meeting
  const validationResult = validateMeeting(meeting)
  if (!validationResult.valid) {
    console.error('Meeting validation failed:', validationResult.errors)
    
    // Dispatch validation error event
    window.dispatchEvent(new CustomEvent('storage-error', {
      detail: {
        type: StorageErrorType.VALIDATION_FAILED,
        key: STORAGE_KEYS.CURRENT_MEETING,
        message: `Meeting validation failed: ${validationResult.errors.join(', ')}`
      }
    }))
    
    return false
  }
  
  // Save current meeting
  const currentSaved = saveToStorage(STORAGE_KEYS.CURRENT_MEETING, meeting)
  
  // Also update in meetings list
  const meetings = loadFromStorage<Meeting[]>(STORAGE_KEYS.MEETINGS, [])
  const existingIndex = meetings.findIndex(m => m.id === meeting.id)
  
  if (existingIndex >= 0) {
    meetings[existingIndex] = meeting
  } else {
    meetings.push(meeting)
  }
  
  const listSaved = saveToStorage(STORAGE_KEYS.MEETINGS, meetings)
  
  return currentSaved && listSaved
}

/**
 * Load a meeting from localStorage
 */
export function loadMeeting(id: string): Meeting | null {
  const meetings = loadFromStorage<Meeting[]>(STORAGE_KEYS.MEETINGS, [])
  const meeting = meetings.find(m => m.id === id)
  
  if (!meeting) {
    return null
  }
  
  // Validate the meeting
  const validationResult = validateMeeting(meeting)
  if (!validationResult.valid) {
    console.warn('Loaded invalid meeting data:', validationResult.errors)
    
    // Create backup of invalid data
    const backupKey = `${STORAGE_KEYS.MEETINGS}_backup_${Date.now()}`
    localStorage.setItem(backupKey, JSON.stringify(meetings))
    
    console.info(`Backed up invalid meetings to ${backupKey}`)
    
    // Dispatch validation warning event
    window.dispatchEvent(new CustomEvent('storage-warning', {
      detail: {
        type: StorageErrorType.VALIDATION_FAILED,
        key: STORAGE_KEYS.MEETINGS,
        message: `Meeting data validation failed. Backup created at ${backupKey}.`
      }
    }))
  }
  
  return meeting
}

/**
 * Delete a meeting from localStorage
 */
export function deleteMeeting(id: string): boolean {
  // Remove from meetings list
  const meetings = loadFromStorage<Meeting[]>(STORAGE_KEYS.MEETINGS, [])
  const filteredMeetings = meetings.filter(m => m.id !== id)
  
  // If current meeting is being deleted, clear it
  const currentMeeting = loadFromStorage<Meeting | null>(STORAGE_KEYS.CURRENT_MEETING, null)
  if (currentMeeting && currentMeeting.id === id) {
    removeFromStorage(STORAGE_KEYS.CURRENT_MEETING)
  }
  
  return saveToStorage(STORAGE_KEYS.MEETINGS, filteredMeetings)
}

// Performance-optimized storage operations
class OptimizedStorage {
  private static instance: OptimizedStorage
  private cache: Map<string, any> = new Map()
  // private pendingWrites: Map<string, any> = new Map()
  private writeQueue: Array<{ key: string; data: any }> = []
  private isProcessingQueue = false

  static getInstance(): OptimizedStorage {
    if (!OptimizedStorage.instance) {
      OptimizedStorage.instance = new OptimizedStorage()
    }
    return OptimizedStorage.instance
  }

  // Debounced batch write operation
  private debouncedBatchWrite = debounce(() => {
    this.processBatchWrite()
  }, 500)

  // Process batch write operations
  private async processBatchWrite() {
    if (this.isProcessingQueue || this.writeQueue.length === 0) return

    this.isProcessingQueue = true
    const batch = [...this.writeQueue]
    this.writeQueue = []

    try {
      // Group writes by key to avoid duplicate operations
      const uniqueWrites = new Map<string, any>()
      batch.forEach(({ key, data }) => {
        uniqueWrites.set(key, data)
      })

      // Execute all writes
      const writePromises = Array.from(uniqueWrites.entries()).map(([key, data]) => {
        return new Promise<void>((resolve) => {
          try {
            localStorage.setItem(key, JSON.stringify(data))
            this.cache.set(key, data)
            resolve()
          } catch (error) {
            console.error(`Failed to write ${key}:`, error)
            resolve()
          }
        })
      })

      await Promise.all(writePromises)
    } finally {
      this.isProcessingQueue = false
    }
  }

  // Optimized save with caching and batching
  saveOptimized<T>(key: string, data: T, immediate = false): boolean {
    try {
      // Update cache immediately
      this.cache.set(key, data)

      if (immediate) {
        // Write immediately for critical data
        localStorage.setItem(key, JSON.stringify(data))
        return true
      } else {
        // Queue for batch write
        this.writeQueue.push({ key, data })
        this.debouncedBatchWrite()
        return true
      }
    } catch (error) {
      console.error(`Error in optimized save for ${key}:`, error)
      return false
    }
  }

  // Optimized load with caching
  loadOptimized<T>(key: string, defaultValue: T): T {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        return this.cache.get(key)
      }

      // Load from localStorage
      const item = localStorage.getItem(key)
      if (!item) {
        this.cache.set(key, defaultValue)
        return defaultValue
      }

      const parsedData = JSON.parse(item) as T
      this.cache.set(key, parsedData)
      return parsedData
    } catch (error) {
      console.error(`Error in optimized load for ${key}:`, error)
      this.cache.set(key, defaultValue)
      return defaultValue
    }
  }

  // Clear cache for a specific key
  clearCache(key: string) {
    this.cache.delete(key)
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear()
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size
  }

  // Force flush pending writes
  async flushPendingWrites(): Promise<void> {
    this.debouncedBatchWrite.cancel?.()
    await this.processBatchWrite()
  }
}

export const optimizedStorage = OptimizedStorage.getInstance()

// Optimized meeting operations
export function saveOptimizedMeeting(meeting: Meeting, immediate = false): boolean {
  // Validate first
  const validationResult = validateMeeting(meeting)
  if (!validationResult.valid) {
    console.error('Meeting validation failed:', validationResult.errors)
    return false
  }

  // Save current meeting
  const currentSaved = optimizedStorage.saveOptimized(STORAGE_KEYS.CURRENT_MEETING, meeting, immediate)
  
  // Update meetings list
  const meetings = optimizedStorage.loadOptimized<Meeting[]>(STORAGE_KEYS.MEETINGS, [])
  const existingIndex = meetings.findIndex(m => m.id === meeting.id)
  
  if (existingIndex >= 0) {
    meetings[existingIndex] = meeting
  } else {
    meetings.push(meeting)
  }
  
  const listSaved = optimizedStorage.saveOptimized(STORAGE_KEYS.MEETINGS, meetings, immediate)
  
  return currentSaved && listSaved
}

export function loadOptimizedMeeting(id: string): Meeting | null {
  const meetings = optimizedStorage.loadOptimized<Meeting[]>(STORAGE_KEYS.MEETINGS, [])
  return meetings.find(m => m.id === id) || null
}

// Throttled storage operations for high-frequency updates
export const throttledSaveMeeting = throttle((meeting: Meeting) => {
  saveOptimizedMeeting(meeting, false)
}, 1000)

// Storage cleanup utilities
export function cleanupOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000) { // 30 days default
  try {
    const meetings = loadFromStorage<Meeting[]>(STORAGE_KEYS.MEETINGS, [])
    const now = Date.now()
    
    const recentMeetings = meetings.filter(meeting => {
      const meetingTime = new Date(meeting.startTime).getTime()
      return (now - meetingTime) < maxAge
    })
    
    if (recentMeetings.length !== meetings.length) {
      saveToStorage(STORAGE_KEYS.MEETINGS, recentMeetings)
      console.log(`Cleaned up ${meetings.length - recentMeetings.length} old meetings`)
    }
  } catch (error) {
    console.error('Error during data cleanup:', error)
  }
}

// Storage compression for large data
export function compressStorageData(data: any): string {
  try {
    // Simple compression by removing unnecessary whitespace and optimizing structure
    const jsonString = JSON.stringify(data)
    
    // Remove unnecessary whitespace
    const compressed = jsonString
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}[\]:,])\s*/g, '$1')
    
    return compressed
  } catch (error) {
    console.error('Error compressing data:', error)
    return JSON.stringify(data)
  }
}

export function decompressStorageData(compressedData: string): any {
  try {
    return JSON.parse(compressedData)
  } catch (error) {
    console.error('Error decompressing data:', error)
    return null
  }
}

// Storage monitoring and optimization
export function monitorStorageUsage() {
  const usage = getStorageSize()
  const quota = 5 * 1024 // 5MB typical localStorage limit
  const usagePercent = (usage / quota) * 100
  
  if (usagePercent > 80) {
    console.warn(`Storage usage is at ${usagePercent.toFixed(1)}% (${usage}KB/${quota}KB)`)
    
    // Trigger cleanup if usage is high
    if (usagePercent > 90) {
      cleanupOldData(7 * 24 * 60 * 60 * 1000) // Clean data older than 7 days
    }
  }
  
  return {
    usage,
    quota,
    usagePercent,
    available: quota - usage
  }
}

// Initialize storage monitoring
export function initializeStorageMonitoring() {
  // Monitor storage usage periodically
  setInterval(() => {
    monitorStorageUsage()
  }, 60000) // Check every minute

  // Cleanup old data on app start
  cleanupOldData()

  // Flush pending writes before page unload
  window.addEventListener('beforeunload', () => {
    optimizedStorage.flushPendingWrites()
  })
}