/**
 * Performance optimization wrapper components
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react'
import { usePerformanceMonitor } from '@/utils/performance'

// Memoized component wrapper
interface MemoizedComponentProps {
  children: React.ReactNode
  deps?: any[]
  name?: string
}

export const MemoizedComponent = memo<MemoizedComponentProps>(({ children, name = 'MemoizedComponent' }) => {
  const { trackRender } = usePerformanceMonitor(name)
  
  useEffect(() => {
    trackRender()
  })
  
  return <>{children}</>
})

// Virtualized list component for large datasets
interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  containerHeight: number
  overscan?: number
  className?: string
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const { trackRender } = usePerformanceMonitor('VirtualizedList')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)

  useEffect(() => {
    trackRender()
  })

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, startIndex, endIndex])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = items.length * itemHeight

  return (
    <div
      ref={scrollRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Lazy loading wrapper
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
}

export function LazyWrapper({ 
  children, 
  fallback = <div>Loading...</div>,
  threshold = 0.1,
  rootMargin = '50px'
}: LazyWrapperProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}

// Debounced input wrapper
interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void
  debounceMs?: number
}

export function DebouncedInput({ 
  onChange, 
  debounceMs = 300, 
  ...props 
}: DebouncedInputProps) {
  const [value, setValue] = React.useState(props.value || '')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }, [onChange, debounceMs])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
    />
  )
}

// Performance monitoring component
export function PerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<any>({})
  const [isVisible, setIsVisible] = React.useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (isVisible) {
        import('@/utils/performance').then(({ performanceMonitor }) => {
          setMetrics(performanceMonitor.getMetrics())
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
      >
        Perf
      </button>
      
      {isVisible && (
        <div className="absolute bottom-8 right-0 bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg min-w-[300px] text-xs">
          <h3 className="font-bold mb-2">Performance Metrics</h3>
          <div className="space-y-1">
            <div>Load Time: {metrics.loadTime?.toFixed(2)}ms</div>
            <div>Memory: {metrics.memoryUsage?.toFixed(2)}MB</div>
            <div>Storage: {metrics.storageSize?.toFixed(2)}KB</div>
            <div>Renders: {metrics.componentRenderCount}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Error boundary with performance tracking
interface PerformanceErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface PerformanceErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class PerformanceErrorBoundary extends React.Component<
  PerformanceErrorBoundaryProps,
  PerformanceErrorBoundaryState
> {
  constructor(props: PerformanceErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): PerformanceErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track performance impact of errors
    import('@/utils/performance').then(({ performanceMonitor }) => {
      performanceMonitor.setMetric('errorCount', performanceMonitor.getMetric('errorCount') + 1)
    })

    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />
      }
      
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for performance tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Component'
    const { trackRender, measureRender } = usePerformanceMonitor(name)

    useEffect(() => {
      trackRender()
    })

    return measureRender(() => <Component {...props} />)
  }

  WrappedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`
  
  return memo(WrappedComponent)
}