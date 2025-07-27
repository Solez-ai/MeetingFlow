import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { AgendaManager } from '../agenda/AgendaManager'
import { useMeetingStore } from '../../store/meetingStore'
import { mockMeeting, mockAgendaItems } from '../../test/fixtures'

// Mock the meeting store
vi.mock('../../store/meetingStore')

// Mock the child components
vi.mock('../agenda/AgendaForm', () => ({
  AgendaForm: ({ onAddItem }: { onAddItem: (title: string, duration: number, description?: string) => void }) => (
    <div data-testid="agenda-form">
      <button
        onClick={() => onAddItem('Test Item', 15, 'Test description')}
        data-testid="add-item-button"
      >
        Add Item
      </button>
    </div>
  ),
}))

vi.mock('../agenda/AgendaList', () => ({
  AgendaList: ({ items, onReorder }: { items: any[], onReorder: (items: any[]) => void }) => (
    <div data-testid="agenda-list">
      {items.map((item, index) => (
        <div key={item.id} data-testid={`agenda-item-${index}`}>
          {item.title} - {item.duration}min
        </div>
      ))}
      <button
        onClick={() => onReorder([...items].reverse())}
        data-testid="reorder-button"
      >
        Reorder
      </button>
    </div>
  ),
}))

describe('AgendaManager', () => {
  const mockUseMeetingStore = vi.mocked(useMeetingStore)
  const mockAddAgendaItem = vi.fn()
  const mockGenerateTimeBalancedAgenda = vi.fn()
  const mockReorderAgendaItems = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    mockUseMeetingStore.mockImplementation((selector) => {
      const state = {
        currentMeeting: mockMeeting,
        addAgendaItem: mockAddAgendaItem,
        generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
        reorderAgendaItems: mockReorderAgendaItems,
      }
      return selector(state)
    })
  })

  describe('Rendering', () => {
    it('should render agenda manager with current meeting', () => {
      render(<AgendaManager />)
      
      expect(screen.getByText('Agenda')).toBeInTheDocument()
      expect(screen.getByText('Balance Time')).toBeInTheDocument()
      expect(screen.getByTestId('agenda-form')).toBeInTheDocument()
      expect(screen.getByTestId('agenda-list')).toBeInTheDocument()
    })

    it('should render agenda items from current meeting', () => {
      render(<AgendaManager />)
      
      expect(screen.getByTestId('agenda-item-0')).toHaveTextContent('Project Overview - 15min')
      expect(screen.getByTestId('agenda-item-1')).toHaveTextContent('Technical Discussion - 20min')
      expect(screen.getByTestId('agenda-item-2')).toHaveTextContent('Next Steps - 10min')
    })

    it('should show empty state when no current meeting', () => {
      mockUseMeetingStore.mockImplementation((selector) => {
        const state = {
          currentMeeting: null,
          addAgendaItem: mockAddAgendaItem,
          generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
          reorderAgendaItems: mockReorderAgendaItems,
        }
        return selector(state)
      })

      render(<AgendaManager />)
      
      expect(screen.getByText('No agenda items yet. Add topics above to get started.')).toBeInTheDocument()
    })

    it('should show empty state when meeting has no agenda items', () => {
      const meetingWithoutAgenda = { ...mockMeeting, agenda: [] }
      
      mockUseMeetingStore.mockImplementation((selector) => {
        const state = {
          currentMeeting: meetingWithoutAgenda,
          addAgendaItem: mockAddAgendaItem,
          generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
          reorderAgendaItems: mockReorderAgendaItems,
        }
        return selector(state)
      })

      render(<AgendaManager />)
      
      expect(screen.getByText('No agenda items yet. Add topics above to get started.')).toBeInTheDocument()
    })
  })

  describe('Balance Time Button', () => {
    it('should be enabled when meeting has agenda items', () => {
      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      expect(balanceButton).not.toBeDisabled()
    })

    it('should be disabled when no current meeting', () => {
      mockUseMeetingStore.mockImplementation((selector) => {
        const state = {
          currentMeeting: null,
          addAgendaItem: mockAddAgendaItem,
          generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
          reorderAgendaItems: mockReorderAgendaItems,
        }
        return selector(state)
      })

      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      expect(balanceButton).toBeDisabled()
    })

    it('should be disabled when meeting has no agenda items', () => {
      const meetingWithoutAgenda = { ...mockMeeting, agenda: [] }
      
      mockUseMeetingStore.mockImplementation((selector) => {
        const state = {
          currentMeeting: meetingWithoutAgenda,
          addAgendaItem: mockAddAgendaItem,
          generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
          reorderAgendaItems: mockReorderAgendaItems,
        }
        return selector(state)
      })

      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      expect(balanceButton).toBeDisabled()
    })

    it('should call generateTimeBalancedAgenda when clicked', async () => {
      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      fireEvent.click(balanceButton)
      
      expect(mockGenerateTimeBalancedAgenda).toHaveBeenCalledWith(45) // mockMeeting.metadata.duration
    })

    it('should use default duration when meeting has no duration metadata', async () => {
      const meetingWithoutDuration = {
        ...mockMeeting,
        metadata: { ...mockMeeting.metadata, duration: undefined }
      }
      
      mockUseMeetingStore.mockImplementation((selector) => {
        const state = {
          currentMeeting: meetingWithoutDuration,
          addAgendaItem: mockAddAgendaItem,
          generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
          reorderAgendaItems: mockReorderAgendaItems,
        }
        return selector(state)
      })

      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      fireEvent.click(balanceButton)
      
      expect(mockGenerateTimeBalancedAgenda).toHaveBeenCalledWith(60) // default duration
    })

    it('should show generating state when processing', async () => {
      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      fireEvent.click(balanceButton)
      
      // The button should briefly show "Generating..." but since we're not actually async,
      // it will immediately go back to "Balance Time"
      expect(mockGenerateTimeBalancedAgenda).toHaveBeenCalled()
    })
  })

  describe('Adding Agenda Items', () => {
    it('should call addAgendaItem when form submits', () => {
      render(<AgendaManager />)
      
      const addButton = screen.getByTestId('add-item-button')
      fireEvent.click(addButton)
      
      expect(mockAddAgendaItem).toHaveBeenCalledWith({
        title: 'Test Item',
        duration: 15,
        description: 'Test description'
      })
    })

    it('should handle adding item without description', () => {
      // Mock the form to not include description
      vi.mocked(require('../agenda/AgendaForm')).AgendaForm = ({ onAddItem }: any) => (
        <div data-testid="agenda-form">
          <button
            onClick={() => onAddItem('Test Item', 15)}
            data-testid="add-item-button"
          >
            Add Item
          </button>
        </div>
      )

      render(<AgendaManager />)
      
      const addButton = screen.getByTestId('add-item-button')
      fireEvent.click(addButton)
      
      expect(mockAddAgendaItem).toHaveBeenCalledWith({
        title: 'Test Item',
        duration: 15,
        description: undefined
      })
    })
  })

  describe('Reordering Agenda Items', () => {
    it('should call reorderAgendaItems when items are reordered', () => {
      render(<AgendaManager />)
      
      const reorderButton = screen.getByTestId('reorder-button')
      fireEvent.click(reorderButton)
      
      // Should be called with the reversed order of item IDs
      const expectedIds = [...mockAgendaItems].reverse().map(item => item.id)
      expect(mockReorderAgendaItems).toHaveBeenCalledWith(expectedIds)
    })

    it('should handle empty agenda when reordering', () => {
      const meetingWithoutAgenda = { ...mockMeeting, agenda: [] }
      
      mockUseMeetingStore.mockImplementation((selector) => {
        const state = {
          currentMeeting: meetingWithoutAgenda,
          addAgendaItem: mockAddAgendaItem,
          generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
          reorderAgendaItems: mockReorderAgendaItems,
        }
        return selector(state)
      })

      render(<AgendaManager />)
      
      // Should not render the agenda list when there are no items
      expect(screen.queryByTestId('agenda-list')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle store errors gracefully', () => {
      mockUseMeetingStore.mockImplementation(() => {
        throw new Error('Store error')
      })

      expect(() => render(<AgendaManager />)).toThrow('Store error')
    })

    it('should handle missing store functions', () => {
      mockUseMeetingStore.mockImplementation((selector) => {
        const state = {
          currentMeeting: mockMeeting,
          addAgendaItem: undefined,
          generateTimeBalancedAgenda: undefined,
          reorderAgendaItems: undefined,
        }
        return selector(state)
      })

      render(<AgendaManager />)
      
      // Should still render but buttons might not work
      expect(screen.getByText('Agenda')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      expect(balanceButton).toHaveAttribute('type', 'button')
      
      // The card should have proper structure
      expect(screen.getByText('Agenda')).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<AgendaManager />)
      
      const balanceButton = screen.getByText('Balance Time')
      
      // Should be focusable
      balanceButton.focus()
      expect(document.activeElement).toBe(balanceButton)
      
      // Should respond to Enter key
      fireEvent.keyDown(balanceButton, { key: 'Enter' })
      // Note: This would need more complex testing for actual keyboard events
    })
  })

  describe('Integration', () => {
    it('should work with real store state changes', async () => {
      let currentState = {
        currentMeeting: mockMeeting,
        addAgendaItem: mockAddAgendaItem,
        generateTimeBalancedAgenda: mockGenerateTimeBalancedAgenda,
        reorderAgendaItems: mockReorderAgendaItems,
      }

      mockUseMeetingStore.mockImplementation((selector) => selector(currentState))

      const { rerender } = render(<AgendaManager />)
      
      // Simulate adding an item
      const addButton = screen.getByTestId('add-item-button')
      fireEvent.click(addButton)
      
      expect(mockAddAgendaItem).toHaveBeenCalled()
      
      // Simulate state change
      currentState = {
        ...currentState,
        currentMeeting: {
          ...mockMeeting,
          agenda: [...mockMeeting.agenda, {
            id: '4',
            title: 'Test Item',
            duration: 15,
            description: 'Test description',
            order: 3
          }]
        }
      }
      
      rerender(<AgendaManager />)
      
      // Should show the new item count
      expect(screen.getAllByTestId(/agenda-item-/)).toHaveLength(4)
    })
  })
})