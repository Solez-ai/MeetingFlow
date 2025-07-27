/**
 * Demonstration component showing comprehensive error handling usage
 */

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  FeatureErrorBoundary, 
  AsyncErrorBoundary, 
  NetworkErrorBoundary 
} from '../layout/ErrorBoundary'
import { 
  FeatureWrapper, 
  NetworkStatus, 
  BrowserCompatibilityChecker,
  ProgressiveEnhancement
} from '../ui/graceful-degradation'
import { 
  LoadingState, 
  SmartLoadingWrapper,
  useLoadingState,
  TranscriptionLoading,
  CollaborationLoading
} from '../ui/loading-states'
import { useFeedback } from '../ui/user-feedback'
import { 
  errorHandler, 
  withErrorHandling, 
  withGracefulDegradation,
  retryManager
} from '@/utils/errorHandling'
import { 
  errorRecoveryManager, 
  withAutoRecovery,
  healthChecker
} from '@/utils/errorRecovery'
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Wifi,
  Download,
  Bug
} from 'lucide-react'

export function ErrorHandlingDemo() {
  const [testData, setTestData] = useState('')
  const [isLoading, setLoading] = useLoadingState('demo-operation')
  const [error, setError] = useState<Error | null>(null)
  const feedback = useFeedback()

  // Simulate network error
  const simulateNetworkError = withErrorHandling(async () => {
    throw new Error('Network connection failed')
  }, 'Network Error Demo', 'network')

  // Simulate storage error
  const simulateStorageError = withErrorHandling(async () => {
    throw new Error('localStorage quota exceeded')
  }, 'Storage Error Demo', 'storage')

  // Simulate WebRTC error
  const simulateWebRTCError = withErrorHandling(async () => {
    throw new Error('WebRTC peer connection failed')
  }, 'WebRTC Error Demo', 'webrtc')

  // Simulate voice error
  const simulateVoiceError = withErrorHandling(async () => {
    throw new Error('Speech recognition not available')
  }, 'Voice Error Demo', 'voice')

  // Simulate unknown error
  const simulateUnknownError = withErrorHandling(async () => {
    throw new Error('Something unexpected happened')
  }, 'Unknown Error Demo', 'unknown')

  // Simulate loading operation
  const simulateLoadingOperation = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      feedback.success('Operation Complete', 'The loading operation finished successfully')
    } catch (error) {
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  // Simulate auto-recovery operation
  const simulateAutoRecovery = withAutoRecovery(async () => {
    if (Math.random() < 0.7) {
      throw new Error('Simulated failure for auto-recovery demo')
    }
    return 'Success!'
  }, 'Auto Recovery Demo', 2)

  // Simulate graceful degradation
  const primaryFunction = async () => {
    if (!navigator.onLine) {
      throw new Error('Network required for primary function')
    }
    return 'Primary function result'
  }

  const fallbackFunction = async () => {
    return 'Fallback function result (offline mode)'
  }

  const gracefulOperation = withGracefulDegradation(
    primaryFunction,
    fallbackFunction,
    'Graceful Degradation Demo'
  )

  // Health check demo
  const runHealthCheck = async () => {
    const results = await healthChecker.runAllChecks()
    const { healthy, unhealthy } = healthChecker.getHealthStatus()
    
    if (unhealthy.length > 0) {
      feedback.warning(
        'Health Check Results',
        `Unhealthy: ${unhealthy.join(', ')}. Healthy: ${healthy.join(', ')}`
      )
    } else {
      feedback.success(
        'Health Check Results',
        `All systems healthy: ${healthy.join(', ')}`
      )
    }
  }

  // Retry mechanism demo
  const retryDemo = async () => {
    try {
      const result = await retryManager.retry(
        'demo-operation',
        async () => {
          if (Math.random() < 0.6) {
            throw new Error('Random failure for retry demo')
          }
          return 'Success after retry!'
        },
        3,
        1000
      )
      feedback.success('Retry Success', result)
    } catch (error) {
      feedback.error('Retry Failed', 'All retry attempts exhausted')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling & User Feedback Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Browser Compatibility Check */}
          <BrowserCompatibilityChecker />
          
          {/* Network Status */}
          <NetworkStatus />
          
          {/* Error Simulation Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button 
              onClick={simulateNetworkError} 
              variant="outline"
              size="sm"
            >
              <Wifi className="mr-2 h-4 w-4" />
              Network Error
            </Button>
            
            <Button 
              onClick={simulateStorageError} 
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Storage Error
            </Button>
            
            <Button 
              onClick={simulateWebRTCError} 
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              WebRTC Error
            </Button>
            
            <Button 
              onClick={simulateVoiceError} 
              variant="outline"
              size="sm"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Voice Error
            </Button>
            
            <Button 
              onClick={simulateUnknownError} 
              variant="outline"
              size="sm"
            >
              <Bug className="mr-2 h-4 w-4" />
              Unknown Error
            </Button>
            
            <Button 
              onClick={simulateLoadingOperation} 
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Loading Demo
            </Button>
          </div>

          {/* Advanced Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button onClick={simulateAutoRecovery} variant="secondary" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Auto Recovery
            </Button>
            
            <Button onClick={gracefulOperation} variant="secondary" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Graceful Degradation
            </Button>
            
            <Button onClick={runHealthCheck} variant="secondary" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Health Check
            </Button>
            
            <Button onClick={retryDemo} variant="secondary" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Demo
            </Button>
          </div>

          {/* Feedback Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => feedback.success('Success!', 'This is a success message')}
              variant="outline"
              size="sm"
              className="text-green-600"
            >
              Success Toast
            </Button>
            
            <Button 
              onClick={() => feedback.error('Error!', 'This is an error message')}
              variant="outline"
              size="sm"
              className="text-red-600"
            >
              Error Toast
            </Button>
            
            <Button 
              onClick={() => feedback.warning('Warning!', 'This is a warning message')}
              variant="outline"
              size="sm"
              className="text-yellow-600"
            >
              Warning Toast
            </Button>
            
            <Button 
              onClick={() => feedback.info('Info!', 'This is an info message')}
              variant="outline"
              size="sm"
              className="text-blue-600"
            >
              Info Toast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Wrapper Demo */}
      <FeatureWrapper
        featureName="webrtc"
        checkFunction={() => !!(window.RTCPeerConnection || window.webkitRTCPeerConnection)}
        showFeatureStatus={true}
      >
        <Card>
          <CardHeader>
            <CardTitle>WebRTC Feature (with graceful degradation)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This content only shows if WebRTC is available.</p>
            <CollaborationLoading />
          </CardContent>
        </Card>
      </FeatureWrapper>

      {/* Progressive Enhancement Demo */}
      <ProgressiveEnhancement
        featureName="speechRecognition"
        featureCheck={() => !!(window.SpeechRecognition || window.webkitSpeechRecognition)}
        baseline={
          <Card>
            <CardContent className="p-4">
              <Label htmlFor="text-input">Text Input (Baseline)</Label>
              <Input 
                id="text-input"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="Type your message here..."
              />
            </CardContent>
          </Card>
        }
        enhanced={
          <Card>
            <CardContent className="p-4">
              <Label htmlFor="voice-input">Voice Input (Enhanced)</Label>
              <div className="flex gap-2">
                <Input 
                  id="voice-input"
                  value={testData}
                  onChange={(e) => setTestData(e.target.value)}
                  placeholder="Speak or type your message..."
                />
                <Button size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        }
      />

      {/* Loading States Demo */}
      <SmartLoadingWrapper
        isLoading={isLoading}
        error={error}
        onRetry={() => setError(null)}
        emptyState={<p>No data available</p>}
        isEmpty={false}
      >
        <Card>
          <CardHeader>
            <CardTitle>Smart Loading Wrapper Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This content is wrapped with smart loading and error handling.</p>
            <TranscriptionLoading />
          </CardContent>
        </Card>
      </SmartLoadingWrapper>

      {/* Error Boundary Demo */}
      <FeatureErrorBoundary 
        featureName="Demo Feature"
        enableRetry={true}
        enableGracefulDegradation={true}
      >
        <Card>
          <CardHeader>
            <CardTitle>Error Boundary Protected Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This content is protected by an error boundary.</p>
            <Button 
              onClick={() => {
                throw new Error('Simulated component error')
              }}
              variant="destructive"
              size="sm"
            >
              Trigger Error
            </Button>
          </CardContent>
        </Card>
      </FeatureErrorBoundary>
    </div>
  )
}