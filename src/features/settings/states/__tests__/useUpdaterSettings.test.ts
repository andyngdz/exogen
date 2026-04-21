import { addToast } from '@heroui/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdaterSettings } from '../useUpdaterSettings'

// Mock @heroui/react
vi.mock('@heroui/react', () => ({
  addToast: vi.fn()
}))

// Helper to create a delayed promise
const createDelayedPromise = <T>(value: T, ms: number): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

describe('useUpdaterSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup electronAPI mock (already mocked in vitest.setup.ts)
    global.window.electronAPI = {
      app: {
        getVersion: vi.fn().mockResolvedValue('1.0.0')
      },
      updater: {
        checkForUpdates: vi
          .fn()
          .mockResolvedValue({ updateAvailable: false, version: undefined }),
        installUpdate: vi.fn().mockResolvedValue(undefined)
      }
    } as unknown as Window['electronAPI']
  })

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      expect(result.current.version).toBe('Development Build')
      expect(result.current.isChecking).toBe(false)
      expect(result.current.onCheck).toBeInstanceOf(Function)

      // Wait for async effect to complete to avoid act() warnings
      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })
    })

    it('should fetch version on mount', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      expect(global.window.electronAPI.app.getVersion).toHaveBeenCalledTimes(1)
    })

    it('should handle missing electronAPI gracefully', async () => {
      global.window.electronAPI = undefined as unknown as Window['electronAPI']

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('Development Build')
      })
    })

    it('should fetch different version values', async () => {
      vi.mocked(global.window.electronAPI.app.getVersion).mockResolvedValue(
        '2.5.3'
      )

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('2.5.3')
      })
    })
  })

  describe('onCheck - no update available', () => {
    it('should set isChecking to true during check', async () => {
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockImplementation(() =>
        createDelayedPromise({ updateAvailable: false }, 100)
      )

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      let checkPromise: Promise<void>
      await act(async () => {
        checkPromise = result.current.onCheck()
      })

      await waitFor(() => {
        expect(result.current.isChecking).toBe(true)
      })

      await act(async () => {
        await checkPromise
      })

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false)
      })
    })

    it('should call checkForUpdates when onCheck is called', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(
        global.window.electronAPI.updater.checkForUpdates
      ).toHaveBeenCalledTimes(1)
    })

    it('should show success toast when no update is available', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(addToast).toHaveBeenCalledWith({
        title: "You're already on the latest version",
        description: 'Current version: 1.0.0',
        color: 'success'
      })
    })

    it('should set isChecking to false after successful check', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      expect(result.current.isChecking).toBe(false)

      await act(async () => {
        await result.current.onCheck()
      })

      expect(result.current.isChecking).toBe(false)
    })
  })

  describe('onCheck - update available', () => {
    it('should not show toast when update is available', async () => {
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockResolvedValue({
        updateAvailable: true,
        version: '2.0.0'
      })

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(addToast).not.toHaveBeenCalled()
    })

    it('should set isChecking to false after update available check', async () => {
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockResolvedValue({
        updateAvailable: true,
        version: '2.0.0'
      })

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(result.current.isChecking).toBe(false)
    })
  })

  describe('onCheck - error handling', () => {
    // Suppress console.error for error handling tests to keep test output clean
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should show error toast when check fails', async () => {
      const error = new Error('Network error')
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockRejectedValue(error)

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(addToast).toHaveBeenCalledWith({
        title: 'Failed to check for updates',
        description: 'Network error',
        color: 'danger'
      })
    })

    it('should handle non-Error exceptions', async () => {
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockRejectedValue('String error')

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(addToast).toHaveBeenCalledWith({
        title: 'Failed to check for updates',
        description: 'Unknown error',
        color: 'danger'
      })
    })

    it('should set isChecking to false after error', async () => {
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockRejectedValue(new Error('Test error'))

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(result.current.isChecking).toBe(false)
    })

    it('should log error to console', async () => {
      const error = new Error('Test error')
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockRejectedValue(error)

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to check for updates',
        error
      )
    })
  })

  describe('version state', () => {
    it('should use correct version in toast message', async () => {
      vi.mocked(global.window.electronAPI.app.getVersion).mockResolvedValue(
        '3.2.1'
      )

      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('3.2.1')
      })

      await act(async () => {
        await result.current.onCheck()
      })

      expect(addToast).toHaveBeenCalledWith({
        title: "You're already on the latest version",
        description: 'Current version: 3.2.1',
        color: 'success'
      })
    })

    it('should handle version updates correctly', async () => {
      const { result, rerender } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      vi.mocked(global.window.electronAPI.app.getVersion).mockResolvedValue(
        '1.1.0'
      )

      rerender()

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })
    })
  })

  describe('multiple checks', () => {
    // Suppress console.error for tests that trigger error paths
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should handle multiple consecutive checks', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      await act(async () => {
        await result.current.onCheck()
      })
      await act(async () => {
        await result.current.onCheck()
      })
      await act(async () => {
        await result.current.onCheck()
      })

      expect(
        global.window.electronAPI.updater.checkForUpdates
      ).toHaveBeenCalledTimes(3)
      expect(addToast).toHaveBeenCalledTimes(3)
      expect(result.current.isChecking).toBe(false)
    })

    it('should handle alternating success and error states', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      // First check succeeds
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockResolvedValue({ updateAvailable: false })
      await act(async () => {
        await result.current.onCheck()
      })

      expect(addToast).toHaveBeenLastCalledWith(
        expect.objectContaining({ color: 'success' })
      )

      // Second check fails
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockRejectedValue(new Error('Failed'))
      await act(async () => {
        await result.current.onCheck()
      })

      expect(addToast).toHaveBeenLastCalledWith(
        expect.objectContaining({ color: 'danger' })
      )

      expect(result.current.isChecking).toBe(false)
    })
  })

  describe('integration', () => {
    it('should provide all expected properties', async () => {
      const { result } = renderHook(() => useUpdaterSettings())

      expect(result.current).toHaveProperty('version')
      expect(result.current).toHaveProperty('isChecking')
      expect(result.current).toHaveProperty('onCheck')

      // Wait for async effect to complete to avoid act() warnings
      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })
    })

    it('should work through complete update check lifecycle', async () => {
      vi.mocked(
        global.window.electronAPI.updater.checkForUpdates
      ).mockImplementation(() =>
        createDelayedPromise({ updateAvailable: false }, 100)
      )

      const { result } = renderHook(() => useUpdaterSettings())

      // Initial state
      expect(result.current.version).toBe('Development Build')
      expect(result.current.isChecking).toBe(false)

      // Version loads
      await waitFor(() => {
        expect(result.current.version).toBe('1.0.0')
      })

      // Start check
      let checkPromise: Promise<void>
      await act(async () => {
        checkPromise = result.current.onCheck()
      })

      await waitFor(() => {
        expect(result.current.isChecking).toBe(true)
      })

      // Check completes
      await act(async () => {
        await checkPromise
      })

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false)
      })

      expect(addToast).toHaveBeenCalledWith({
        title: "You're already on the latest version",
        description: 'Current version: 1.0.0',
        color: 'success'
      })
    })
  })
})
