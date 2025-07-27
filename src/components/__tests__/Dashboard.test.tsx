import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { Dashboard } from '../Dashboard'
import { useMeetingStore } from '../../store/meetingStore'
import { mockMeeting } from '../../test/fixtures'

// Mock the meeting store
vi.mock('../../store/meetingStore')

// Mock the components that Dashboard uses
vi.mock('../meeting/MeetingList', () => ({
  MeetingList: ({ limit, showSearch }: { limit?: number; showSearch?: boolean }) => (
    <div data-testid="meeting-list">
      Meeting List (limit: {limit}, showSearch: {showSearch?.toString()})
    </div>
  ),
}))

vi.mock('../meeting/MeetingCreateForm', () => ({
  MeetingCreateForm: ({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) => (
    <div data-testid="meeting-create-form">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onSuccess}>Success</button>
    </div>
  ),
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to} data-testid="link">
      {children}
    </a>
  ),
}))

describe('Dashboard', () => {
  const mockUseMeetingStore = vi.mocked(useMeetingStore)

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    mockUseMeetingStore.mockReturnValue({
      meetings: [],
      currentMeeting: null,
      getState: () => ({
        loadMeeting: vi.fn().mockReturnValue(null),
      }),
    } as any)
  })

  it('should render loading skeleton initially', () => {
    render(<Dashboard />)

    // Should show loading skeleton elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should render dashboard with no meetings', async () => {
    render(<Dashboard />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Welcome to MeetingFlow')).toBeInTheDocument()
    })

    // Should show stats with zero values
    expect(screen.getByText('0')).toBeInTheDocument() // Total meetings
    expect(screen.getByText('No meetings yet')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Meeting')).toBeInTheDocument()
  })

  it('should render dashboard with meetings', async () => {
    const mockMeetings = [mockMeeting]
    const mockLoadMeeting = vi.fn().mockReturnValue(mockMeeting)

    mockUseMeetingStore.mockReturnValue({
      meetings: mockMeetings,
      currentMeeting: null,
      getState: () => ({
        loadMeeting: mockLoadMeeting,
      }),
    } as any)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Welcome to MeetingFlow')).toBeInTheDocument()
    })

    // Should show correct stats
    expect(screen.getByText('1')).toBeInTheDocument() // Total meetings
    expect(screen.getByText('3')).toBeInTheDocument() // Total tasks (from mockMeeting)
    
    // Should show meeting list
    expect(screen.getByTestId('meeting-list')).toBeInTheDocument()
  })

  it('should calculate productivity percentage correctly', async () => {
    const meetingWithTasks = {
      ...mockMeeting,
      tasks: [
        { ...mockMeeting.tasks[0], status: 'Done' },
        { ...mockMeeting.tasks[1], status: 'Todo' },
        { ...mockMeeting.tasks[2], status: 'Done' },
      ],
    }

    mockUseMeetingStore.mockReturnValue({
      meetings: [meetingWithTasks],
      currentMeeting: null,
      getState: () => ({
        loadMeeting: vi.fn().mockReturnValue(meetingWithTasks),
      }),
    } as any)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Welcome to MeetingFlow')).toBeInTheDocument()
    })

    // Should show 67% productivity (2 done out of 3 total)
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('should show current meeting button when there is a current meeting', async () => {
    mockUseMeetingStore.mockReturnValue({
      meetings: [mockMeeting],
      currentMeeting: mockMeeting,
      getState: () => ({
        loadMeeting: vi.fn().mockReturnValue(mockMeeting),
      }),
    } as any)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Continue Current Meeting')).toBeInTheDocument()
    })
  })

  it('should show create form when Start New Meeting is clicked', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Start New Meeting')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Start New Meeting'))

    expect(screen.getByTestId('meeting-create-form')).toBeInTheDocument()
  })

  it('should hide create form when cancel is clicked', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Start New Meeting')).toBeInTheDocument()
    })

    // Open create form
    fireEvent.click(screen.getByText('Start New Meeting'))
    expect(screen.getByTestId('meeting-create-form')).toBeInTheDocument()

    // Cancel form
    fireEvent.click(screen.getByText('Cancel'))
    
    await waitFor(() => {
      expect(screen.queryByTestId('meeting-create-form')).not.toBeInTheDocument()
    })
  })

  it('should hide create form when success is triggered', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Start New Meeting')).toBeInTheDocument()
    })

    // Open create form
    fireEvent.click(screen.getByText('Start New Meeting'))
    expect(screen.getByTestId('meeting-create-form')).toBeInTheDocument()

    // Trigger success
    fireEvent.click(screen.getByText('Success'))
    
    await waitFor(() => {
      expect(screen.queryByTestId('meeting-create-form')).not.toBeInTheDocument()
    })
  })

  it('should show correct greeting based on time of day', async () => {
    // Mock Date to return a specific time
    const mockDate = new Date('2024-01-15T10:00:00Z') // 10 AM
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Good morning')).toBeInTheDocument()
    })

    vi.restoreAllMocks()
  })

  it('should show quick actions in sidebar', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    expect(screen.getByText('Create New Meeting')).toBeInTheDocument()
    expect(screen.getByText('Start Transcription')).toBeInTheDocument()
    expect(screen.getByText('Manage Tasks')).toBeInTheDocument()
  })

  it('should show features highlight section', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Why MeetingFlow?')).toBeInTheDocument()
    })

    expect(screen.getByText('Privacy-First')).toBeInTheDocument()
    expect(screen.getByText('No Backend Required')).toBeInTheDocument()
    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument()
  })

  it('should show pro tips when there are meetings', async () => {
    mockUseMeetingStore.mockReturnValue({
      meetings: [mockMeeting],
      currentMeeting: null,
      getState: () => ({
        loadMeeting: vi.fn().mockReturnValue(mockMeeting),
      }),
    } as any)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
    })

    expect(screen.getByText(/voice commands/)).toBeInTheDocument()
    expect(screen.getByText(/transcribing/)).toBeInTheDocument()
  })

  it('should not show pro tips when there are no meetings', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Welcome to MeetingFlow')).toBeInTheDocument()
    })

    expect(screen.queryByText('Pro Tips')).not.toBeInTheDocument()
  })

  it('should handle pending tasks calculation correctly', async () => {
    const meetingWithPendingTasks = {
      ...mockMeeting,
      tasks: [
        { ...mockMeeting.tasks[0], status: 'Todo' },
        { ...mockMeeting.tasks[1], status: 'In Progress' },
        { ...mockMeeting.tasks[2], status: 'Done' },
      ],
    }

    mockUseMeetingStore.mockReturnValue({
      meetings: [meetingWithPendingTasks],
      currentMeeting: null,
      getState: () => ({
        loadMeeting: vi.fn().mockReturnValue(meetingWithPendingTasks),
      }),
    } as any)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Welcome to MeetingFlow')).toBeInTheDocument()
    })

    // Should show 2 pending tasks (Todo + In Progress)
    const pendingTasksElements = screen.getAllByText('2')
    expect(pendingTasksElements.length).toBeGreaterThan(0)
  })

  it('should animate in after loading', async () => {
    render(<Dashboard />)

    // Initially should be loading
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    // After loading completes, should have fade-in animation
    await waitFor(() => {
      expect(screen.getByText('Welcome to MeetingFlow')).toBeInTheDocument()
    })

    // Wait a bit more for animation to trigger
    await waitFor(() => {
      expect(document.querySelector('.animate-in')).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})