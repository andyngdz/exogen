import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useBackendSetupStatus } from '../useBackendSetupStatus'
import { useBackendSetupStatusStore } from '../useBackendSetupStatusStore'
import type { BackendStatusPayload } from '@types'
import { BackendStatusLevel } from '@types'

afterEach(() => {
  useBackendSetupStatusStore.getState().clear()
})

describe('useBackendSetupStatus', () => {
  it('subscribes to backend setup status, handles events, and cleans up on unmount', async () => {
    const mockUnsubscribe = vi.fn()
    let listener: ((payload: BackendStatusPayload) => void) | undefined

    // Override electronAPI.onBackendSetupStatus to capture listener
    window.electronAPI.onBackendSetupStatus = vi
      .fn()
      .mockImplementation((cb: (payload: BackendStatusPayload) => void) => {
        listener = cb
        return mockUnsubscribe
      })

    const { result, unmount } = renderHook(() => useBackendSetupStatus())

    expect(window.electronAPI.onBackendSetupStatus).toHaveBeenCalled()

    // Emit a payload wrapped in act since it updates state
    const payload: BackendStatusPayload = {
      level: BackendStatusLevel.Info,
      message: 'backend starting',
      commands: [{ label: 'Fix', command: 'echo fix' }]
    }
    act(() => {
      listener?.(payload)
    })

    await waitFor(() => {
      expect(result.current.entries.length).toBe(1)
      expect(result.current.entries[0]).toMatchObject({
        level: payload.level,
        message: payload.message,
        commands: payload.commands
      })
      expect(typeof result.current.entries[0]?.timestamp).toBe('number')
    })

    // Unmount should unsubscribe and clear store
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
    expect(useBackendSetupStatusStore.getState().entries).toHaveLength(0)
  })

  it('does nothing when electronAPI.onBackendSetupStatus is unavailable', () => {
    // Remove handler to exercise early return path
    // @ts-expect-error intentionally undefined for test
    window.electronAPI.onBackendSetupStatus = undefined

    const { unmount } = renderHook(() => useBackendSetupStatus())

    // No subscription attempted
    expect(window.electronAPI.onBackendSetupStatus).toBeUndefined()

    // Should not throw on unmount
    expect(() => unmount()).not.toThrow()
  })
})
