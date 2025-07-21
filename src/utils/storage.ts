/**
 * Storage utility for localStorage operations
 * 
 * This module provides type-safe access to localStorage with
 * error handling and automatic JSON parsing/stringifying.
 */

/**
 * Save data to localStorage with error handling
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
    return false
  }
}

/**
 * Load data from localStorage with error handling
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : defaultValue
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error)
    return defaultValue
  }
}

/**
 * Remove data from localStorage with error handling
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error)
    return false
  }
}

/**
 * Clear all app-related data from localStorage
 */
export function clearAppStorage(): boolean {
  try {
    // Get all keys that start with our app prefix
    const appKeys = Object.keys(localStorage).filter(key => key.startsWith('meetingflow:'))
    
    // Remove each key
    appKeys.forEach(key => localStorage.removeItem(key))
    
    return true
  } catch (error) {
    console.error('Error clearing app storage:', error)
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