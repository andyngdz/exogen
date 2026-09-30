import { beforeEach, describe, expect, it } from 'vitest'
import { APP_SHELL_ACTIONS, useAppShellStore } from '../useAppShellStore'

describe('useAppShellStore', () => {
  beforeEach(() => {
    useAppShellStore.setState({
      isModelSearchOpen: false,
      isHistoryOpen: false,
      isLogsOpen: false
    })
  })

  it('starts with every overlay closed and the history column hidden', () => {
    expect(useAppShellStore.getState()).toMatchObject({
      isModelSearchOpen: false,
      isHistoryOpen: false,
      isLogsOpen: false
    })
  })

  it('opens and closes model search and logs', () => {
    APP_SHELL_ACTIONS.setModelSearchOpen(true)
    APP_SHELL_ACTIONS.setLogsOpen(true)
    expect(useAppShellStore.getState().isModelSearchOpen).toBe(true)
    expect(useAppShellStore.getState().isLogsOpen).toBe(true)

    APP_SHELL_ACTIONS.setModelSearchOpen(false)
    APP_SHELL_ACTIONS.setLogsOpen(false)
    expect(useAppShellStore.getState().isModelSearchOpen).toBe(false)
    expect(useAppShellStore.getState().isLogsOpen).toBe(false)
  })

  it('toggles the history column', () => {
    APP_SHELL_ACTIONS.toggleHistory()
    expect(useAppShellStore.getState().isHistoryOpen).toBe(true)

    APP_SHELL_ACTIONS.toggleHistory()
    expect(useAppShellStore.getState().isHistoryOpen).toBe(false)
  })
})
