import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '../useAutoSave'

// Mock the debounce utility
vi.mock('@/lib/utils', () => ({
  debounce: vi.fn((fn, delay) => {
    // Return a simple mock that calls the function immediately
    return vi.fn((...args) => fn(...args))
  })
}))

// Mock the constants
vi.mock('@/lib/constants', () => ({
  APP_CONFIG: {
    AUTO_SAVE_INTERVAL: 1000
  }
}))

describe('useAutoSave', () => {
  let mockSaveFunction: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    mockSaveFunction = vi.fn()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call save function immediately on mount', () => {
    const testData = { id: 1, name: 'test' }
    
    renderHook(() => useAutoSave(testData, mockSaveFunction))
    
    expect(mockSaveFunction).toHaveBeenCalledWith(testData)
    expect(mockSaveFunction).toHaveBeenCalledTimes(1)
  })

  it('should not call save function when disabled', () => {
    const testData = { id: 1, name: 'test' }
    
    renderHook(() => useAutoSave(testData, mockSaveFunction, 1000, false))
    
    expect(mockSaveFunction).not.toHaveBeenCalled()
  })

  it('should set up auto-save interval when enabled', () => {
    const testData = { id: 1, name: 'test' }
    
    renderHook(() => useAutoSave(testData, mockSaveFunction, 1000, true))
    
    // Clear the initial call
    mockSaveFunction.mockClear()
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(mockSaveFunction).toHaveBeenCalledWith(testData)
  })

  it('should use custom interval', () => {
    const testData = { id: 1, name: 'test' }
    const customInterval = 2000
    
    renderHook(() => useAutoSave(testData, mockSaveFunction, customInterval, true))
    
    mockSaveFunction.mockClear()
    
    // Fast-forward by less than custom interval
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(mockSaveFunction).not.toHaveBeenCalled()
    
    // Fast-forward to custom interval
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(mockSaveFunction).toHaveBeenCalledWith(testData)
  })

  it('should save latest data when data changes', () => {
    const initialData = { id: 1, name: 'initial' }
    
    const { rerender } = renderHook(
      ({ data }) => useAutoSave(data, mockSaveFunction),
      { initialProps: { data: initialData } }
    )
    
    mockSaveFunction.mockClear()
    
    // Update data
    const updatedData = { id: 1, name: 'updated' }
    rerender({ data: updatedData })
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(mockSaveFunction).toHaveBeenCalledWith(updatedData)
  })

  it('should return manual save function', () => {
    const testData = { id: 1, name: 'test' }
    
    const { result } = renderHook(() => useAutoSave(testData, mockSaveFunction))
    
    expect(result.current.save).toBeInstanceOf(Function)
    
    mockSaveFunction.mockClear()
    
    // Call manual save
    act(() => {
      result.current.save()
    })
    
    expect(mockSaveFunction).toHaveBeenCalledWith(testData)
  })

  it('should clean up interval on unmount', () => {
    const testData = { id: 1, name: 'test' }
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    const { unmount } = renderHook(() => useAutoSave(testData, mockSaveFunction))
    
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should handle save function errors gracefully', () => {
    const testData = { id: 1, name: 'test' }
    const errorSaveFunction = vi.fn().mockImplementation(() => {
      throw new Error('Save failed')
    })
    
    // Should not throw error
    expect(() => {
      renderHook(() => useAutoSave(testData, errorSaveFunction))
    }).not.toThrow()
    
    expect(errorSaveFunction).toHaveBeenCalledWith(testData)
  })

  it('should handle rapid data changes', () => {
    const initialData = { id: 1, name: 'initial' }
    
    const { rerender } = renderHook(
      ({ data }) => useAutoSave(data, mockSaveFunction),
      { initialProps: { data: initialData } }
    )
    
    mockSaveFunction.mockClear()
    
    // Rapidly change data multiple times
    const changes = [
      { id: 1, name: 'change1' },
      { id: 1, name: 'change2' },
      { id: 1, name: 'change3' },
      { id: 1, name: 'final' }
    ]
    
    changes.forEach(data => {
      rerender({ data })
    })
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    // Should save the latest data
    expect(mockSaveFunction).toHaveBeenCalledWith(changes[changes.length - 1])
  })

  it('should restart interval when enabled state changes', () => {
    const testData = { id: 1, name: 'test' }
    
    const { rerender } = renderHook(
      ({ enabled }) => useAutoSave(testData, mockSaveFunction, 1000, enabled),
      { initialProps: { enabled: false } }
    )
    
    expect(mockSaveFunction).not.toHaveBeenCalled()
    
    // Enable auto-save
    rerender({ enabled: true })
    
    expect(mockSaveFunction).toHaveBeenCalledWith(testData)
    
    mockSaveFunction.mockClear()
    
    // Disable auto-save
    rerender({ enabled: false })
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    // Should not save when disabled
    expect(mockSaveFunction).not.toHaveBeenCalled()
  })

  it('should handle complex data types', () => {
    const complexData = {
      meeting: {
        id: '123',
        title: 'Test Meeting',
        agenda: [
          { id: '1', title: 'Item 1', duration: 15 },
          { id: '2', title: 'Item 2', duration: 30 }
        ],
        tasks: [
          { id: 't1', title: 'Task 1', status: 'Todo' },
          { id: 't2', title: 'Task 2', status: 'Done' }
        ]
      },
      metadata: {
        lastModified: new Date().toISOString(),
        version: 1
      }
    }
    
    renderHook(() => useAutoSave(complexData, mockSaveFunction))
    
    expect(mockSaveFunction).toHaveBeenCalledWith(complexData)
  })

  it('should handle null and undefined data', () => {
    renderHook(() => useAutoSave(null, mockSaveFunction))
    expect(mockSaveFunction).toHaveBeenCalledWith(null)
    
    mockSaveFunction.mockClear()
    
    renderHook(() => useAutoSave(undefined, mockSaveFunction))
    expect(mockSaveFunction).toHaveBeenCalledWith(undefined)
  })
})