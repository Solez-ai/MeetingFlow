/**
 * Storage utility for localStorage operations
 * 
 * This module provides type-safe access to localStorage with
 * error handling, validation, and automatic JSON parsing/stringifying.
 */

import { validateMeeting } from './validation'
import { Meeting } from '@/types'

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