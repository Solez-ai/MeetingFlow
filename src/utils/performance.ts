/**
 * Performance monitoring and optimization utilities
 */

// Performance metrics interface
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  bundleSize: number
  memoryUsage: number
  storageSize: number
  componentRenderCount: number
}

// Performance observer for monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()
  private observers: PerformanceObserver[] = []
  private renderCounts: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.metrics.set('loadTime', navEntry.loadEventEnd - navEntry.navigationStart)
            this.metrics.set('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart)
            this.metrics.set('firstPaint', navEntry.responseEnd - navEntry.navigationStart)
          }
        })
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.metrics.set(entry.name, entry.startTime)
        })
      })
      paintObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(paintObserver)

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          this.metrics.set('largestContentfulPaint', lastEntry.startTime)
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.metrics.set('cumulativeLayoutShift', clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)

    } catch (error) {
      console.warn('Performance observers not supported:', error)
    }
  }

  // Track component render counts
  trackComponentRender(componentName: string) {
    const currentCount = this.renderCounts.get(componentName) || 0
    this.renderCounts.set(componentName, currentCount + 1)
  }

  // Get component render count
  getComponentRenderCount(componentName: string): number {
    return this.renderCounts.get(componentName) || 0
  }

  // Get all render counts
  getAllRenderCounts(): Record<string, number> {
    return Object.fromEntries(this.renderCounts)
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    this.metrics.set(name, end - start)
    return result
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    this.metrics.set(name, end - start)
    return result
  }

  // Get memory usage
  getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  // Get storage size
  getStorageSize(): number {
    try {
      let totalSize = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key) || ''
          totalSize += key.length + value.length
        }
      }
      return totalSize / 1024 // KB
    } catch (error) {
      return 0
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics {
    return {
      loadTime: this.metrics.get('loadTime') || 0,
      renderTime: this.metrics.get('renderTime') || 0,
      bundleSize: this.metrics.get('bundleSize') || 0,
      memoryUsage: this.getMemoryUsage(),
      storageSize: this.getStorageSize(),
      componentRenderCount: Array.from(this.renderCounts.values()).reduce((sum, count) => sum + count, 0),
    }
  }

  // Get specific metric
  getMetric(name: string): number {
    return this.metrics.get(name) || 0
  }

  // Set metric
  setMetric(name: string, value: number) {
    this.metrics.set(name, value)
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear()
    this.renderCounts.clear()
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  // Log performance report
  logPerformanceReport() {
    const metrics = this.getMetrics()
    console.group('🚀 Performance Report')
    console.log('Load Time:', `${metrics.loadTime.toFixed(2)}ms`)
    console.log('Memory Usage:', `${metrics.memoryUsage.toFixed(2)}MB`)
    console.log('Storage Size:', `${metrics.storageSize.toFixed(2)}KB`)
    console.log('Component Renders:', metrics.componentRenderCount)
    console.log('First Paint:', `${this.getMetric('first-paint').toFixed(2)}ms`)
    console.log('First Contentful Paint:', `${this.getMetric('first-contentful-paint').toFixed(2)}ms`)
    console.log('Largest Contentful Paint:', `${this.getMetric('largestContentfulPaint').toFixed(2)}ms`)
    console.log('Cumulative Layout Shift:', this.getMetric('cumulativeLayoutShift').toFixed(4))
    console.groupEnd()
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const trackRender = () => {
    performanceMonitor.trackComponentRender(componentName)
  }

  const measureRender = <T>(fn: () => T): T => {
    return performanceMonitor.measureFunction(`${componentName}-render`, fn)
  }

  const getRenderCount = () => {
    return performanceMonitor.getComponentRenderCount(componentName)
  }

  return {
    trackRender,
    measureRender,
    getRenderCount,
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null

  const executedFunction = function (...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }

  executedFunction.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return executedFunction
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return

  // Estimate bundle size from script tags
  const scripts = document.querySelectorAll('script[src]')
  let totalSize = 0

  scripts.forEach(script => {
    const src = script.getAttribute('src')
    if (src && src.includes('assets')) {
      // This is a rough estimation - in production you'd want more accurate measurements
      totalSize += 100 // Rough estimate in KB
    }
  })

  performanceMonitor.setMetric('bundleSize', totalSize)
  return totalSize
}

// Performance optimization recommendations
export function getPerformanceRecommendations(): string[] {
  const recommendations: string[] = []
  const metrics = performanceMonitor.getMetrics()

  if (metrics.loadTime > 3000) {
    recommendations.push('Consider implementing code splitting to reduce initial bundle size')
  }

  if (metrics.memoryUsage > 50) {
    recommendations.push('Memory usage is high. Check for memory leaks and optimize component re-renders')
  }

  if (metrics.storageSize > 5000) {
    recommendations.push('localStorage usage is high. Consider implementing data cleanup strategies')
  }

  if (metrics.componentRenderCount > 1000) {
    recommendations.push('High number of component renders detected. Consider using React.memo and useMemo')
  }

  const lcp = performanceMonitor.getMetric('largestContentfulPaint')
  if (lcp > 2500) {
    recommendations.push('Largest Contentful Paint is slow. Optimize critical rendering path')
  }

  const cls = performanceMonitor.getMetric('cumulativeLayoutShift')
  if (cls > 0.1) {
    recommendations.push('High Cumulative Layout Shift detected. Ensure proper sizing for dynamic content')
  }

  return recommendations
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Log performance report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      analyzeBundleSize()
      performanceMonitor.logPerformanceReport()
      
      const recommendations = getPerformanceRecommendations()
      if (recommendations.length > 0) {
        console.group('💡 Performance Recommendations')
        recommendations.forEach(rec => console.log(`• ${rec}`))
        console.groupEnd()
      }
    }, 1000)
  })

  // Monitor memory usage periodically
  setInterval(() => {
    const memoryUsage = performanceMonitor.getMemoryUsage()
    if (memoryUsage > 100) { // 100MB threshold
      console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`)
    }
  }, 30000) // Check every 30 seconds
}