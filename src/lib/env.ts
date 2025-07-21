/**
 * Environment variable configuration for API keys
 * 
 * This module provides type-safe access to environment variables
 * and validates that required variables are present.
 */

interface EnvConfig {
  ASSEMBLYAI_API_KEY: string
  EMAILJS_USER_ID: string
  EMAILJS_SERVICE_ID: string
  EMAILJS_TEMPLATE_ID: string
}

/**
 * Get environment variables with validation
 */
export function getEnvConfig(): EnvConfig {
  const config = {
    ASSEMBLYAI_API_KEY: import.meta.env.VITE_ASSEMBLYAI_API_KEY,
    EMAILJS_USER_ID: import.meta.env.VITE_EMAILJS_USER_ID,
    EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  }

  // Validate required environment variables
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`)
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  return config as EnvConfig
}

/**
 * Check if all required environment variables are set
 */
export function validateEnvConfig(): boolean {
  try {
    getEnvConfig()
    return true
  } catch (error) {
    return false
  }
}