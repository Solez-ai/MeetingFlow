import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAppStorage,
  isStorageAvailable,
  getStorageSize,
  saveMeeting,
  loadMeeting,
  deleteMeeting,
  STORAGE_KEYS,
  StorageError,
  StorageErrorType,
} from '../storage'
import { mockMeeting } from '../../test/fixtures'
import { mockLocalStorage } from '../../test/utils'

describe('Storage Utils', () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>

  beforeEach(() => {
    mockStorage = mockLocalStorage()
    vi.stubGlobal('localStorage', mockStorage)
    vi.clearAllMocks()
  })

  describe('saveToStorage', () => {
    it('should save data to localStorage successfully', () => {
      const testData = { test: 'value' }
      const result = saveToStorage('test-key', testData)

      expect(result).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData))
    })

    it('should handle quota exceeded error', () => {
      const testData = { test: 'value' }
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError')
      mockStorage.setItem.mockImplementation(() => {
        throw quotaError
      })

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
      const result = saveToStorage('test-key', testData)

      expect(result).toBe(false)
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage-error',
          detail: expect.objectContaining({
            type: StorageErrorType.QUOTA_EXCEEDED,
            key: 'test-key',
          }),
        })
      )
    })

    it('should validate meeting data when requested', () => {
      const invalidMeeting = { id: '', title: '' } // Invalid meeting
      const result = saveToStorage(STORAGE_KEYS.CURRENT_MEETING, invalidMeeting, true)

      expect(result).toBe(false)
      expect(mockStorage.setItem).not.toHaveBeenCalled()
    })

    it('should save valid meeting data when validation is enabled', () => {
      const result = saveToStorage(STORAGE_KEYS.CURRENT_MEETING, mockMeeting, true)

      expect(result).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_MEETING,
        JSON.stringify(mockMeeting)
      )
    })
  })

  describe('loadFromStorage', () => {
    it('should load data from localStorage successfully', () => {
      const testData = { test: 'value' }
      mockStorage.getItem.mockReturnValue(JSON.stringify(testData))

      const result = loadFromStorage('test-key', {})

      expect(result).toEqual(testData)
      expect(mockStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return default value when item does not exist', () => {
      const defaultValue = { default: true }
      mockStorage.getItem.mockReturnValue(null)

      const result = loadFromStorage('test-key', defaultValue)

      expect(result).toEqual(defaultValue)
    })

    it('should handle parse errors gracefully', () => {
      mockStorage.getItem.mockReturnValue('invalid json')
      const defaultValue = { default: true }
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const result = loadFromStorage('test-key', defaultValue)

      expect(result).toEqual(defaultValue)
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage-error',
          detail: expect.objectContaining({
            type: StorageErrorType.PARSE_ERROR,
            key: 'test-key',
          }),
        })
      )
    })

    it('should validate meeting data when requested', () => {
      const invalidMeeting = { id: '', title: '' }
      mockStorage.getItem.mockReturnValue(JSON.stringify(invalidMeeting))
      const defaultValue = mockMeeting
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const result = loadFromStorage(STORAGE_KEYS.CURRENT_MEETING, defaultValue, true)

      expect(result).toEqual(defaultValue)
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage-warning',
        })
      )
    })
  })

  describe('removeFromStorage', () => {
    it('should remove item from localStorage successfully', () => {
      const result = removeFromStorage('test-key')

      expect(result).toBe(true)
      expect(mockStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should handle errors when removing items', () => {
      mockStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed')
      })
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const result = removeFromStorage('test-key')

      expect(result).toBe(false)
      expect(dispatchEventSpy).toHaveBeenCalled()
    })
  })

  describe('clearAppStorage', () => {
    it('should clear all app-related storage keys', () => {
      // Mock localStorage.keys to return app keys
      Object.defineProperty(mockStorage, 'length', { value: 3 })
      vi.spyOn(Object, 'keys').mockReturnValue([
        'meetingflow:meetings',
        'meetingflow:settings',
        'other-app:data',
      ])

      const result = clearAppStorage()

      expect(result).toBe(true)
      expect(mockStorage.removeItem).toHaveBeenCalledWith('meetingflow:meetings')
      expect(mockStorage.removeItem).toHaveBeenCalledWith('meetingflow:settings')
      expect(mockStorage.removeItem).not.toHaveBeenCalledWith('other-app:data')
    })
  })

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      const result = isStorageAvailable()
      expect(result).toBe(true)
    })

    it('should return false when localStorage throws an error', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage not available')
      })

      const result = isStorageAvailable()
      expect(result).toBe(false)
    })
  })

  describe('getStorageSize', () => {
    it('should calculate storage size correctly', () => {
      Object.defineProperty(mockStorage, 'length', { value: 2 })
      mockStorage.key = vi.fn()
        .mockReturnValueOnce('key1')
        .mockReturnValueOnce('key2')
      mockStorage.getItem = vi.fn()
        .mockReturnValueOnce('value1') // 4 chars
        .mockReturnValueOnce('value22') // 7 chars

      const result = getStorageSize()

      // key1 (4) + value1 (6) + key2 (4) + value22 (7) = 21 chars = 0.02 KB (rounded to 0)
      expect(result).toBe(0)
    })

    it('should handle errors when calculating size', () => {
      Object.defineProperty(mockStorage, 'length', { value: 1 })
      mockStorage.key = vi.fn().mockImplementation(() => {
        throw new Error('Key access failed')
      })

      const result = getStorageSize()
      expect(result).toBe(0)
    })
  })

  describe('saveMeeting', () => {
    it('should save a valid meeting successfully', () => {
      mockStorage.getItem.mockReturnValue('[]') // Empty meetings array

      const result = saveMeeting(mockMeeting)

      expect(result).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_MEETING,
        JSON.stringify(mockMeeting)
      )
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MEETINGS,
        JSON.stringify([mockMeeting])
      )
    })

    it('should update existing meeting in meetings list', () => {
      const existingMeetings = [mockMeeting]
      mockStorage.getItem.mockReturnValue(JSON.stringify(existingMeetings))

      const updatedMeeting = { ...mockMeeting, title: 'Updated Meeting' }
      const result = saveMeeting(updatedMeeting)

      expect(result).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MEETINGS,
        JSON.stringify([updatedMeeting])
      )
    })

    it('should handle invalid meeting data', () => {
      const invalidMeeting = { id: '', title: '' } as any
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const result = saveMeeting(invalidMeeting)

      expect(result).toBe(false)
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage-error',
          detail: expect.objectContaining({
            type: StorageErrorType.VALIDATION_FAILED,
          }),
        })
      )
    })
  })

  describe('loadMeeting', () => {
    it('should load a meeting by ID successfully', () => {
      const meetings = [mockMeeting]
      mockStorage.getItem.mockReturnValue(JSON.stringify(meetings))

      const result = loadMeeting(mockMeeting.id)

      expect(result).toEqual(mockMeeting)
    })

    it('should return null when meeting is not found', () => {
      mockStorage.getItem.mockReturnValue('[]')

      const result = loadMeeting('non-existent-id')

      expect(result).toBeNull()
    })

    it('should handle invalid meeting data with backup', () => {
      const invalidMeeting = { ...mockMeeting, id: '' } // Invalid meeting
      const meetings = [invalidMeeting]
      mockStorage.getItem.mockReturnValue(JSON.stringify(meetings))
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const result = loadMeeting(invalidMeeting.id)

      expect(result).toEqual(invalidMeeting) // Still returns the data
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage-warning',
        })
      )
    })
  })

  describe('deleteMeeting', () => {
    it('should delete a meeting successfully', () => {
      const meetings = [mockMeeting]
      mockStorage.getItem
        .mockReturnValueOnce(JSON.stringify(meetings)) // For meetings list
        .mockReturnValueOnce(JSON.stringify(mockMeeting)) // For current meeting

      const result = deleteMeeting(mockMeeting.id)

      expect(result).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.MEETINGS, '[]')
      expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_MEETING)
    })

    it('should not remove current meeting if different ID', () => {
      const otherMeeting = { ...mockMeeting, id: 'other-id' }
      const meetings = [mockMeeting, otherMeeting]
      mockStorage.getItem
        .mockReturnValueOnce(JSON.stringify(meetings)) // For meetings list
        .mockReturnValueOnce(JSON.stringify(mockMeeting)) // For current meeting

      const result = deleteMeeting(otherMeeting.id)

      expect(result).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MEETINGS,
        JSON.stringify([mockMeeting])
      )
      expect(mockStorage.removeItem).not.toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_MEETING)
    })
  })
})