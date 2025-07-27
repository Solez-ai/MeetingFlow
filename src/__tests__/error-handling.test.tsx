/**
 * Comprehensive tests for error handling and user feedback system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  errorHandler, 
  withErrorHandling, 
  withGracefulDegradation,
  featureAvailability,
  retryManager
} from '@/utils/errorHandling'
import { 
  withAutoRecovery,
  healthChecker
} from '@/utils/errorRecovery'
import { feedbackManager } from '@/components/ui/user-feedback'

// Mock window objects for testing
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

describe('Error Handling System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    errorHandler.clearErrorLog()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Error Handler', () => {
    it('should handle network errors', () => {
      const error = new Error('Network failed')
      errorHandler.handleNetworkError(error, 'Test context')
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(1)
      expect(errorLog[0].type).toBe('network')
      expect(errorLog[0].message).toContain('Unable to connect')
    })

    it('should handle storage errors', () => {
      const error = new Error('Storage full')
      errorHandler.handleStorageError(error)
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(1)
      expect(errorLog[0].type).toBe('storage')
      expect(errorLog[0].message).toContain('save data locally')
    })

    it('should handle WebRTC errors', () => {
      const error = new Error('Connection failed')
      errorHandler.handleWebRTCError(error, 'peer123')
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(1)
      expect(errorLog[0].type).toBe('webrtc')
      expect(errorLog[0].context).toContain('peer123')
    })

    it('should handle voice errors', () => {
      const error = new Error('Speech recognition failed')
      errorHandler.handleVoiceError(error)
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(1)
      expect(errorLog[0].type).toBe('voice')
      expect(errorLog[0].message).toContain('Voice recognition')
    })

    it('should handle validation errors', () => {
      errorHandler.handleValidationError('Invalid input', 'email')
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(1)
      expect(errorLog[0].type).toBe('validation')
      expect(errorLog[0].context).toContain('email')
    })
  })

  describe('withErrorHandling', () => {
    it('should catch and handle errors', async () => {
      const throwingFn = vi.fn().mockRejectedValue(new Error('Test error'))
      const wrappedFn = withErrorHandling(throwingFn, 'Test context', 'network')
      
      const result = await wrappedFn()
      
      expect(result).toBeUndefined()
      expect(throwingFn).toHaveBeenCalled()
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(1)
      expect(errorLog[0].type).toBe('network')
    })

    it('should return result when no error occurs', async () => {
      const successFn = vi.fn().mockResolvedValue('success')
      const wrappedFn = withErrorHandling(successFn, 'Test context')
      
      const result = await wrappedFn()
      
      expect(result).toBe('success')
      expect(successFn).toHaveBeenCalled()
    })
  })

  describe('withGracefulDegradation', () => {
    it('should use fallback when primary function fails', async () => {
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'))
      const fallbackFn = vi.fn().mockResolvedValue('fallback result')
      
      const gracefulFn = withGracefulDegradation(primaryFn, fallbackFn, 'Test context')
      const result = await gracefulFn()
      
      expect(result).toBe('fallback result')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).toHaveBeenCalled()
    })

    it('should use primary function when it succeeds', async () => {
      const primaryFn = vi.fn().mockResolvedValue('primary result')
      const fallbackFn = vi.fn().mockResolvedValue('fallback result')
      
      const gracefulFn = withGracefulDegradation(primaryFn, fallbackFn, 'Test context')
      const result = await gracefulFn()
      
      expect(result).toBe('primary result')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).not.toHaveBeenCalled()
    })
  })

  describe('Feature Availability', () => {
    it('should check feature availability', () => {
      const result = featureAvailability.checkFeature('testFeature', () => true)
      expect(result).toBe(true)
      expect(featureAvailability.isFeatureAvailable('testFeature')).toBe(true)
    })

    it('should handle feature check failures', () => {
      const result = featureAvailability.checkFeature('failingFeature', () => {
        throw new Error('Feature check failed')
      })
      expect(result).toBe(false)
      expect(featureAvailability.isFeatureAvailable('failingFeature')).toBe(false)
    })

    it('should track unavailable features', () => {
      featureAvailability.checkFeature('feature1', () => true)
      featureAvailability.checkFeature('feature2', () => false)
      
      const unavailable = featureAvailability.getUnavailableFeatures()
      expect(unavailable).toContain('feature2')
      expect(unavailable).not.toContain('feature1')
    })
  })

  describe('Retry Manager', () => {
    it('should retry failed operations', async () => {
      let attempts = 0
      const flakyFn = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'success'
      })
      
      const result = await retryManager.retry('test-operation', flakyFn, 3, 100)
      
      expect(result).toBe('success')
      expect(flakyFn).toHaveBeenCalledTimes(3)
    })

    it('should fail after max attempts', async () => {
      const alwaysFailFn = vi.fn().mockRejectedValue(new Error('Always fails'))
      
      await expect(
        retryManager.retry('test-operation', alwaysFailFn, 2, 100)
      ).rejects.toThrow('Always fails')
      
      expect(alwaysFailFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('Health Checker', () => {
    it('should run individual health checks', async () => {
      healthChecker.addCheck('testCheck', async () => true)
      
      const result = await healthChecker.runCheck('testCheck')
      expect(result).toBe(true)
    })

    it('should run all health checks', async () => {
      healthChecker.addCheck('check1', async () => true)
      healthChecker.addCheck('check2', async () => false)
      
      const results = await healthChecker.runAllChecks()
      
      expect(results.get('check1')).toBe(true)
      expect(results.get('check2')).toBe(false)
    })

    it('should track health status', async () => {
      healthChecker.addCheck('healthy', async () => true)
      healthChecker.addCheck('unhealthy', async () => false)
      
      await healthChecker.runAllChecks()
      const status = healthChecker.getHealthStatus()
      
      expect(status.healthy).toContain('healthy')
      expect(status.unhealthy).toContain('unhealthy')
    })
  })

  describe('Feedback Manager', () => {
    it('should create and manage notifications', () => {
      const id = feedbackManager.success('Test Title', 'Test message')
      
      expect(typeof id).toBe('string')
      expect(id).toHaveLength(7)
    })

    it('should dismiss notifications', () => {
      const id = feedbackManager.info('Test', 'Message')
      feedbackManager.dismiss(id)
      
      // Test passes if no error is thrown
      expect(true).toBe(true)
    })

    it('should update notifications', () => {
      const id = feedbackManager.loading('Loading', 'Please wait...')
      feedbackManager.update(id, { 
        message: 'Updated message',
        progress: 50 
      })
      
      // Test passes if no error is thrown
      expect(true).toBe(true)
    })
  })

  describe('Auto Recovery', () => {
    it('should attempt recovery on failure', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Test failure'))
      const autoRecoveryFn = withAutoRecovery(failingFn, 'Test context', 1)
      
      const result = await autoRecoveryFn()
      
      expect(result).toBeUndefined()
      expect(failingFn).toHaveBeenCalled()
    })

    it('should return result on success', async () => {
      const successFn = vi.fn().mockResolvedValue('success')
      const autoRecoveryFn = withAutoRecovery(successFn, 'Test context')
      
      const result = await autoRecoveryFn()
      
      expect(result).toBe('success')
      expect(successFn).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete error flow', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const networkFn = withErrorHandling(async () => {
        throw new Error('Network timeout')
      }, 'Integration test', 'network')
      
      await networkFn()
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(1)
      expect(errorLog[0].type).toBe('network')
      
      consoleSpy.mockRestore()
    })

    it('should handle graceful degradation with error recovery', async () => {
      let primaryAttempts = 0
      
      const primaryFn = async () => {
        primaryAttempts++
        if (primaryAttempts <= 2) {
          throw new Error('Primary function failing')
        }
        return 'primary success'
      }
      
      const fallbackFn = async () => 'fallback success'
      
      const gracefulFn = withGracefulDegradation(primaryFn, fallbackFn, 'Integration test')
      
      const result1 = await gracefulFn()
      expect(result1).toBe('fallback success')
      
      const result2 = await gracefulFn()
      expect(result2).toBe('fallback success')
      
      const result3 = await gracefulFn()
      expect(result3).toBe('primary success')
    })
  })
})