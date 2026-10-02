import { UpdaterState } from '@types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateStateWatcher } from '../useUpdateStateWatcher'
import { useUpdaterStore } from '../useUpdaterStore'

describe('useUpdateStateWatcher', () => {
  beforeEach(() => {
    useUpdaterStore.setState(useUpdaterStore.getInitialState(), true)
  })

  it('writes main process updater state into the store', () => {
    let listener: (state: UpdaterState) => void = () => {}
    vi.mocked(window.electronAPI.updater.onState).mockImplementation((next) => {
      listener = next
      return () => {}
    })

    renderHook(() => useUpdateStateWatcher())
    listener({ downloadedVersion: '1.20.0', lastCheckedAt: 1000 })

    expect(useUpdaterStore.getState()).toMatchObject({
      downloadedVersion: '1.20.0',
      lastCheckedAt: 1000
    })
  })

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn()
    vi.mocked(window.electronAPI.updater.onState).mockReturnValue(unsubscribe)

    const { unmount } = renderHook(() => useUpdateStateWatcher())
    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
