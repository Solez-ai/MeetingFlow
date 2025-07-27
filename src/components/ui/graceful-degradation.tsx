/**
 * Graceful degradation components for handling feature failures
 */

import { useState, useEffect, ReactNode } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  RefreshCw,
  Settings,
  ExternalLink,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { featureAvailability, checkBrowserFeatures } from '@/utils/errorHandling'

interface FeatureWrapperProps {
  featureName: string
  children: ReactNode
  fallback?: ReactNode
  checkFunction?: () => boolean
  enableAutoRetry?: boolean
  retryInterval?: number
  showFeatureStatus?: boolean
}

export function FeatureWrapper({
  featureName,
  children,
  fallback,
  checkFunction,
  enableAutoRetry = false,
  retryInterval = 30000,
  showFeatureStatus = false
}: FeatureWrapperProps) {
  const [isAvailable, setIsAvailable] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkFeature = async () => {
    setIsChecking(true)
    try {
      const available = checkFunction ? checkFunction() : featureAvailability.isFeatureAvailable(featureName)
      setIsAvailable(available)
      setLastCheck(new Date())
    } catch (error) {
      console.warn(`Feature check failed for ${featureName}:`, error)
      setIsAvailable(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkFeature()

    if (enableAutoRetry) {
      const interval = setInterval(checkFeature, retryInterval)
      return () => clearInterval(interval)
    }
  }, [featureName, enableAutoRetry, retryInterval])

  if (!isAvailable) {
    return fallback || (
      <FeatureFallback
        featureName={featureName}
        onRetry={checkFeature}
        isRetrying={isChecking}
        lastCheck={lastCheck}
        showStatus={showFeatureStatus}
      />
    )
  }

  return (
    <div className="relative">
      {children}
      {showFeatureStatus && (
        <FeatureStatusIndicator
          featureName={featureName}
          isAvailable={isAvailable}
          lastCheck={lastCheck}
        />
      )}
    </div>
  )
}

interface FeatureFallbackProps {
  featureName: string
  onRetry: () => void
  isRetrying: boolean
  lastCheck: Date | null
  showStatus: boolean
}

function FeatureFallback({ 
  featureName, 
  onRetry, 
  isRetrying, 
  lastCheck,
  showStatus 
}: FeatureFallbackProps) {
  const getFeatureInfo = (name: string) => {
    switch (name.toLowerCase()) {
      case 'webrtc':
        return {
          icon: <Video className="h-5 w-5" />,
          title: 'Real-time Collaboration Unavailable',
          description: 'WebRTC is not supported in your browser. You can still use all other features.',
          suggestion: 'Try using a modern browser like Chrome, Firefox, or Edge.',
          helpLink: 'https://caniuse.com/rtcpeerconnection'
        }
      case 'speechrecognition':
        return {
          icon: <MicOff className="h-5 w-5" />,
          title: 'Voice Commands Unavailable',
          description: 'Speech recognition is not supported. You can use text input instead.',
          suggestion: 'Voice commands work best in Chrome-based browsers.',
          helpLink: 'https://caniuse.com/speech-recognition'
        }
      case 'mediarecorder':
        return {
          icon: <Mic className="h-5 w-5" />,
          title: 'Audio Recording Unavailable',
          description: 'Media recording is not supported. You can upload audio files instead.',
          suggestion: 'Try using a modern browser with media recording support.',
          helpLink: 'https://caniuse.com/mediarecorder'
        }
      case 'notifications':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: 'Notifications Disabled',
          description: 'Browser notifications are not available. You can still receive in-app alerts.',
          suggestion: 'Enable notifications in your browser settings for better experience.',
          helpLink: null
        }
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: `${featureName} Unavailable`,
          description: 'This feature is currently not available in your browser.',
          suggestion: 'Try refreshing the page or using a different browser.',
          helpLink: null
        }
    }
  }

  const info = getFeatureInfo(featureName)

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="text-yellow-600">
            {info.icon}
          </div>
          <div>
            <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200">
              {info.title}
            </CardTitle>
            <CardDescription className="text-yellow-600 dark:text-yellow-400">
              {info.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            💡 {info.suggestion}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Check Again
                </>
              )}
            </Button>
            
            {info.helpLink && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(info.helpLink!, '_blank')}
                className="text-yellow-700 hover:bg-yellow-100"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Learn More
              </Button>
            )}
          </div>

          {showStatus && lastCheck && (
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              Last checked: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface FeatureStatusIndicatorProps {
  featureName: string
  isAvailable: boolean
  lastCheck: Date | null
}

function FeatureStatusIndicator({ featureName, isAvailable, lastCheck }: FeatureStatusIndicatorProps) {
  return (
    <div className="absolute top-2 right-2">
      <Badge
        variant={isAvailable ? "default" : "destructive"}
        className="text-xs"
      >
        <div className={cn(
          "w-2 h-2 rounded-full mr-1",
          isAvailable ? "bg-green-500" : "bg-red-500"
        )} />
        {featureName}
      </Badge>
    </div>
  )
}

// Network status component
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastOnline, setLastOnline] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Wifi className="h-4 w-4" />
        <span className="text-sm">Online</span>
      </div>
    )
  }

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <WifiOff className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              You're offline
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Some features may not work properly
            </p>
            {lastOnline && (
              <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                Last online: {lastOnline.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Browser compatibility checker
export function BrowserCompatibilityChecker() {
  const [incompatibleFeatures, setIncompatibleFeatures] = useState<string[]>([])

  useEffect(() => {
    checkBrowserFeatures()
    setIncompatibleFeatures(featureAvailability.getUnavailableFeatures())
  }, [])

  if (incompatibleFeatures.length === 0) {
    return null
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Info className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200">
            Limited Browser Support
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-yellow-600 dark:text-yellow-400 mb-3">
          Some features are not available in your current browser:
        </CardDescription>
        
        <div className="space-y-2">
          {incompatibleFeatures.map(feature => (
            <div key={feature} className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300 capitalize">
                {feature.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            💡 For the best experience, try using Chrome, Firefox, or Edge.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Progressive enhancement wrapper
interface ProgressiveEnhancementProps {
  baseline: ReactNode
  enhanced?: ReactNode
  featureCheck: () => boolean
  featureName: string
}

export function ProgressiveEnhancement({
  baseline,
  enhanced,
  featureCheck,
  featureName
}: ProgressiveEnhancementProps) {
  const [canUseEnhanced, setCanUseEnhanced] = useState(false)

  useEffect(() => {
    try {
      setCanUseEnhanced(featureCheck())
    } catch (error) {
      console.warn(`Progressive enhancement check failed for ${featureName}:`, error)
      setCanUseEnhanced(false)
    }
  }, [featureCheck, featureName])

  return (
    <div>
      {canUseEnhanced && enhanced ? enhanced : baseline}
    </div>
  )
}