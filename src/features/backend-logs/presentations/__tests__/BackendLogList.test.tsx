import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { BackendLogList } from '../BackendLogList'
import type { LogEntry } from '@types'

// Mock dependencies
vi.mock('../../states', () => ({
  useBackendLog: vi.fn()
}))

vi.mock('@/services', () => ({
  dateFormatter: {
    timeFromTimestamp: vi.fn((timestamp) => `${timestamp}`)
  }
}))

vi.mock('../../services/backend-logs', () => ({
  backendLogsService: {
    onGetLogColor: vi.fn((level: string) => {
      switch (level) {
        case 'error':
          return 'text-danger'
        case 'warn':
          return 'text-warning'
        default:
          return 'text-success'
      }
    }),
    onGetBackgroundColor: vi.fn(() => 'bg-success')
  }
}))

import { useBackendLog } from '../../states'

const mockUseBackendLog = vi.mocked(useBackendLog)

describe('BackendLogList', () => {
  const mockScrollRef = { current: null }
  const mockVirtualizer = {
    getVirtualItems: vi.fn<() => unknown[]>(() => []),
    getTotalSize: vi.fn(() => 1000),
    measureElement: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseBackendLog.mockReturnValue({
      logs: [],
      scrollRef: mockScrollRef,
      rowVirtualizer: mockVirtualizer as never,
      isStreaming: false,
      clearLogs: vi.fn()
    })
  })

  it('renders scrollable container', () => {
    const { container } = render(<BackendLogList />)
    // The first div should be the scrollable container
    const scrollContainer = container.firstChild
    expect(scrollContainer).toHaveClass('py-4', 'overflow-y-auto')
  })

  it('renders empty list when no logs', () => {
    const { container } = render(<BackendLogList />)

    const relativeDiv = container.querySelector('.relative')
    expect(relativeDiv).toBeInTheDocument()
    expect(relativeDiv).toHaveStyle({ height: '1000px' })
  })

  it('renders log entries', () => {
    const mockLogs: LogEntry[] = [
      { timestamp: 1234567890, level: 'info', message: 'Test log' }
    ]

    mockVirtualizer.getVirtualItems.mockReturnValue([
      {
        index: 0,
        key: 'log-0',
        start: 0,
        size: 50,
        measureElement: vi.fn(),
        lane: 0,
        end: 50
      }
    ])

    mockUseBackendLog.mockReturnValue({
      logs: mockLogs,
      scrollRef: mockScrollRef,
      rowVirtualizer: mockVirtualizer as never,
      isStreaming: false,
      clearLogs: vi.fn()
    })

    render(<BackendLogList />)

    expect(screen.getByText('Test log')).toBeInTheDocument()
    expect(screen.getByText('1234567890')).toBeInTheDocument()
  })

  it('applies correct color classes', () => {
    const mockLogs: LogEntry[] = [
      { timestamp: 1234567890, level: 'error', message: 'Error log' }
    ]

    mockVirtualizer.getVirtualItems.mockReturnValue([
      {
        index: 0,
        key: 'log-0',
        start: 0,
        size: 50,
        measureElement: vi.fn(),
        lane: 0,
        end: 50
      }
    ])

    mockUseBackendLog.mockReturnValue({
      logs: mockLogs,
      scrollRef: mockScrollRef,
      rowVirtualizer: mockVirtualizer as never,
      isStreaming: false,
      clearLogs: vi.fn()
    })

    render(<BackendLogList />)

    const message = screen.getByText('Error log')
    expect(message).toHaveClass('text-danger')
  })

  it('strips ANSI color codes from log messages', () => {
    // Mock log with ANSI escape sequences (like from Python colorlog)
    const mockLogs: LogEntry[] = [
      {
        timestamp: 1234567890,
        level: 'info',
        message: '\u001b[32mGreen text\u001b[0m and \u001b[31mred text\u001b[0m'
      }
    ]

    mockVirtualizer.getVirtualItems.mockReturnValue([
      {
        index: 0,
        key: 'log-0',
        start: 0,
        size: 50,
        measureElement: vi.fn(),
        lane: 0,
        end: 50
      }
    ])

    mockUseBackendLog.mockReturnValue({
      logs: mockLogs,
      scrollRef: mockScrollRef,
      rowVirtualizer: mockVirtualizer as never,
      isStreaming: false,
      clearLogs: vi.fn()
    })

    render(<BackendLogList />)

    // Should display the text without ANSI codes
    expect(screen.getByText('Green text and red text')).toBeInTheDocument()
  })
})
