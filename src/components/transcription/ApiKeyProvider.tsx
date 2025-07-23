import { useEffect } from 'react'
import { useMeetingStore } from '@/store/meetingStore'
import { getEnvConfig, validateEnvConfig } from '@/lib/env'

/**
 * This component automatically configures API keys from environment variables
 * It should be rendered once at the application root level
 */
export function ApiKeyProvider() {
  const setAssemblyApiKey = useMeetingStore(state => state.setAssemblyApiKey)
  
  useEffect(() => {
    // Check if environment variables are configured
    if (validateEnvConfig()) {
      try {
        const config = getEnvConfig()
        
        // Configure AssemblyAI API key if not already set in localStorage
        const storedApiKey = localStorage.getItem('assemblyApiKey')
        if (!storedApiKey && config.ASSEMBLYAI_API_KEY) {
          setAssemblyApiKey(config.ASSEMBLYAI_API_KEY)
          console.log('AssemblyAI API key configured from environment variables')
        }
      } catch (error) {
        console.error('Error configuring API keys:', error)
      }
    }
  }, [setAssemblyApiKey])
  
  // This is a utility component that doesn't render anything
  return null
}