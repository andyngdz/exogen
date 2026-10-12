import { act } from '@testing-library/react'
import { BackendStatusLevel, type BackendStatusPayload } from '@types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BACKEND_SETUP_STATUS_ACTIONS,
  MAX_BACKEND_STATUS_MESSAGES,
  useBackendSetupStatusStore
} from '../useBackendSetupStatusStore'

const makePayload = (
  overrides: Partial<BackendStatusPayload> = {}
): BackendStatusPayload => ({
  level: overrides.level ?? BackendStatusLevel.Info,
  message: overrides.message ?? 'default message',
  commands: overrides.commands
})

const addEntry = (payload: BackendStatusPayload) => {
  act(() => {
    BACKEND_SETUP_STATUS_ACTIONS.addEntry(payload)
  })
}

const getEntries = () => useBackendSetupStatusStore.getState().entries

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
})

afterEach(() => {
  act(() => {
    BACKEND_SETUP_STATUS_ACTIONS.clear()
  })
  vi.useRealTimers()
})

describe('useBackendSetupStatusStore', () => {
  it('appends new entries with timestamp', () => {
    const payload = makePayload({ message: 'first entry' })

    const expectedTimestamp = Date.now()

    addEntry(payload)

    const [entry] = getEntries()

    expect(entry).toMatchObject({ ...payload, timestamp: expectedTimestamp })
  })

  it('respects max history size', () => {
    for (let index = 0; index < MAX_BACKEND_STATUS_MESSAGES + 10; index += 1) {
      addEntry(makePayload({ message: `entry-${index}` }))
      vi.advanceTimersByTime(1)
    }

    const entries = getEntries()

    expect(entries).toHaveLength(MAX_BACKEND_STATUS_MESSAGES)
    expect(entries[0]?.message).toBe(`entry-10`)
    expect(entries.at(-1)?.message).toBe(
      `entry-${MAX_BACKEND_STATUS_MESSAGES + 9}`
    )
  })

  it('clears entries', () => {
    addEntry(makePayload({ message: 'to be cleared' }))

    act(() => {
      BACKEND_SETUP_STATUS_ACTIONS.clear()
    })

    expect(getEntries()).toHaveLength(0)
  })
})
