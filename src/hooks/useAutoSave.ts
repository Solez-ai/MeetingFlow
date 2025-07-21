import { useEffect, useRef } from 'react'
import { APP_CONFIG } from '@/lib/constants'
import { debounce } from '@/lib/utils'

/**
 * Hook for auto-saving data at regular intervals
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => void,
  interval = APP_CONFIG.AUTO_SAVE_INTERVAL,
  enabled = true
) {
  // Keep a ref to the latest data
  const dataRef = useRef(data)
  
  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data
  }, [data])
  
  // Create debounced save function
  const debouncedSave = useRef(
    debounce((data: T) => {
      saveFunction(data)
    }, interval)
  ).current
  
  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) return
    
    // Save immediately on mount
    saveFunction(dataRef.current)
    
    // Set up interval for auto-save
    const intervalId = setInterval(() => {
      debouncedSave(dataRef.current)
    }, interval)
    
    // Clean up
    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, interval, saveFunction, debouncedSave])
  
  // Return a function to trigger save manually
  const save = () => {
    saveFunction(dataRef.current)
  }
  
  return { save }
}