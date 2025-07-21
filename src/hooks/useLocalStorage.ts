import { useState, useEffect } from 'react'
import { saveToStorage, loadFromStorage } from '@/utils/storage'

/**
 * Hook for using localStorage with automatic JSON parsing/stringifying
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get stored value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    return loadFromStorage<T>(key, initialValue)
  })
  
  // Update localStorage when storedValue changes
  useEffect(() => {
    saveToStorage(key, storedValue)
  }, [key, storedValue])
  
  return [storedValue, setStoredValue] as const
}