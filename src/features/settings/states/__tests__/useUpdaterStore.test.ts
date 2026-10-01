import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  UPDATER_ACTIONS,
  useHasPendingUpdate,
  useUpdaterStore
} from '../useUpdaterStore'

describe('useUpdaterStore', () => {
  beforeEach(() => {
    useUpdaterStore.setState(useUpdaterStore.getInitialState(), true)
  })

  it('has no pending update until one is downloaded', () => {
    const { result, rerender } = renderHook(() => useHasPendingUpdate())
    expect(result.current).toBe(false)

    UPDATER_ACTIONS.setUpdaterState({ downloadedVersion: '1.20.0' })
    rerender()

    expect(result.current).toBe(true)
  })

  it('keeps the update but drops the flag after Later', () => {
    UPDATER_ACTIONS.setUpdaterState({ downloadedVersion: '1.20.0' })
    UPDATER_ACTIONS.dismiss()

    const { result } = renderHook(() => useHasPendingUpdate())

    expect(result.current).toBe(false)
    expect(useUpdaterStore.getState().downloadedVersion).toBe('1.20.0')
  })
})
