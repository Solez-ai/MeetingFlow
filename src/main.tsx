import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { validateEnvConfig } from './lib/env'
import { isStorageAvailable } from './utils/storage'

// Validate environment and browser capabilities
const isEnvValid = validateEnvConfig()
const isStorageValid = isStorageAvailable()

// Create root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

// Render app or error message
if (!isEnvValid || !isStorageValid) {
  root.render(
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md p-8 rounded-lg shadow-lg bg-card">
        <h2 className="text-2xl font-bold text-destructive mb-4">Configuration Error</h2>
        {!isEnvValid && (
          <p className="text-card-foreground mb-4">
            Missing required environment variables. Please check your .env file.
          </p>
        )}
        {!isStorageValid && (
          <p className="text-card-foreground mb-4">
            LocalStorage is not available. This application requires localStorage to function.
            Please enable cookies and localStorage in your browser settings.
          </p>
        )}
      </div>
    </div>
  )
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
