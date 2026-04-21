import { renderHook, waitFor } from '@testing-library/react'
import type { ElectronAPI, LogEntry } from '@types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBackendLogCollector } from '../useBackendLogCollector'
import { useBackendLogStore } from '../useBackendLogStore'

const noop = () => {}

vi.mock('../useBackendLogStore', () => ({
  useBackendLogStore: vi.fn()
}))

describe('useBackendLogCollector', () => {
  const mockAddLog = vi.fn()
  const mockSetIsStreaming = vi.fn()
  const mockIsLogStreaming = vi.fn()
  const mockOnLog = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useBackendLogStore).mockReturnValue({
      logs: [],
      isStreaming: false,
      addLog: mockAddLog,
      clearLogs: vi.fn(),
      setIsStreaming: mockSetIsStreaming,
      reset: vi.fn()
    })

    globalThis.window.electronAPI = {
      downloadImage: vi.fn(),
      selectFile: vi.fn().mockResolvedValue(null),
      onBackendSetupStatus: vi.fn(),
      app: {
        getVersion: vi.fn().mockResolvedValue('0.0.0')
      },
      backend: {
        getPort: vi.fn().mockResolvedValue(8000),
        isLogStreaming: mockIsLogStreaming.mockResolvedValue(false),
        onLog: mockOnLog.mockReturnValue(noop),
        openBackendFolder: vi.fn().mockResolvedValue('')
      },
      updater: {
        checkForUpdates: vi.fn().mockResolvedValue(undefined),
        downloadUpdate: vi.fn().mockResolvedValue(undefined),
        installUpdate: vi.fn().mockResolvedValue(undefined),
        getUpdateInfo: vi.fn().mockResolvedValue({ updateAvailable: false }),
        onUpdateStatus: vi.fn().mockReturnValue(noop)
      }
    } as ElectronAPI
  })

  afterEach(() => {
    delete (globalThis.window as { electronAPI?: ElectronAPI }).electronAPI
  })

  it('checks streaming status on mount', async () => {
    renderHook(() => useBackendLogCollector())

    await waitFor(() => {
      expect(mockIsLogStreaming).toHaveBeenCalled()
    })
  })

  it('subscribes to log events on mount', () => {
    renderHook(() => useBackendLogCollector())

    expect(mockOnLog).toHaveBeenCalled()
  })

  it('unsubscribes from log events on unmount', () => {
    const mockUnsubscribe = vi.fn()
    mockOnLog.mockReturnValue(mockUnsubscribe)

    const { unmount } = renderHook(() => useBackendLogCollector())
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('adds log when onLog callback is called', async () => {
    let logCallback: ((log: LogEntry) => void) | undefined

    mockOnLog.mockImplementation((callback: (log: LogEntry) => void) => {
      logCallback = callback
      return noop
    })

    renderHook(() => useBackendLogCollector())

    await waitFor(() => {
      expect(mockOnLog).toHaveBeenCalled()
    })

    const testLog: LogEntry = {
      timestamp: Date.now(),
      level: 'info',
      message: 'Test message'
    }

    logCallback?.(testLog)

    expect(mockAddLog).toHaveBeenCalledWith(testLog)
  })
})
