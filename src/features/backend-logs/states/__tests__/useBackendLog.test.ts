import { renderHook, waitFor } from '@testing-library/react'
import type { LogEntry } from '@types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBackendLog } from '../useBackendLog'
import { useBackendLogStore } from '../useBackendLogStore'

vi.mock('../useBackendLogStore', () => ({
  useBackendLogStore: vi.fn()
}))

const mockScrollToIndex = vi.fn()

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getTotalSize: () => 1000,
    getVirtualItems: () => [],
    scrollToIndex: mockScrollToIndex,
    measureElement: vi.fn()
  }))
}))

describe('useBackendLog', () => {
  const mockClearLogs = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockScrollToIndex.mockClear()

    vi.mocked(useBackendLogStore).mockReturnValue({
      logs: [],
      isStreaming: false,
      addLog: vi.fn(),
      clearLogs: mockClearLogs,
      setIsStreaming: vi.fn(),
      reset: vi.fn()
    })
  })

  describe('Initial Setup', () => {
    it('should return logs from store', () => {
      const mockLogs: LogEntry[] = [
        { timestamp: Date.now(), level: 'info', message: 'Test log' }
      ]

      vi.mocked(useBackendLogStore).mockReturnValue({
        logs: mockLogs,
        isStreaming: false,
        addLog: vi.fn(),
        clearLogs: mockClearLogs,
        setIsStreaming: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useBackendLog())

      expect(result.current.logs).toEqual(mockLogs)
    })

    it('should return isStreaming from store', () => {
      vi.mocked(useBackendLogStore).mockReturnValue({
        logs: [],
        isStreaming: true,
        addLog: vi.fn(),
        clearLogs: mockClearLogs,
        setIsStreaming: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useBackendLog())

      expect(result.current.isStreaming).toBe(true)
    })
  })

  describe('clearLogs', () => {
    it('should expose clearLogs from store', () => {
      const { result } = renderHook(() => useBackendLog())

      result.current.clearLogs()

      expect(mockClearLogs).toHaveBeenCalled()
    })
  })

  describe('Virtual Scroller', () => {
    it('should return rowVirtualizer', () => {
      const { result } = renderHook(() => useBackendLog())

      expect(result.current.rowVirtualizer).toBeDefined()
    })

    it('should return scrollRef', () => {
      const { result } = renderHook(() => useBackendLog())

      expect(result.current.scrollRef).toBeDefined()
      expect(result.current.scrollRef.current).toBeNull()
    })

    it('should auto-scroll to last log index when logs change', async () => {
      const newLogs: LogEntry[] = [
        { timestamp: Date.now(), level: 'info', message: 'Log 1' },
        { timestamp: Date.now(), level: 'info', message: 'Log 2' },
        { timestamp: Date.now(), level: 'info', message: 'Log 3' }
      ]

      vi.mocked(useBackendLogStore).mockReturnValue({
        logs: newLogs,
        isStreaming: false,
        addLog: vi.fn(),
        clearLogs: mockClearLogs,
        setIsStreaming: vi.fn(),
        reset: vi.fn()
      })

      renderHook(() => useBackendLog())

      await waitFor(() => {
        expect(mockScrollToIndex).toHaveBeenCalledWith(2, {
          align: 'end',
          behavior: 'smooth'
        })
      })
    })

    it('should not call scrollToIndex when logs array is empty', () => {
      vi.mocked(useBackendLogStore).mockReturnValue({
        logs: [],
        isStreaming: false,
        addLog: vi.fn(),
        clearLogs: mockClearLogs,
        setIsStreaming: vi.fn(),
        reset: vi.fn()
      })

      renderHook(() => useBackendLog())

      expect(mockScrollToIndex).not.toHaveBeenCalled()
    })
  })
})
