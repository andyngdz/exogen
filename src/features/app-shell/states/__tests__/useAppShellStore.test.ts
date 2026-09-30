import { AppView } from '@/features/app-shell/types'
import {
  SettingsTab,
  useSettingsStore
} from '@/features/settings/states/useSettingsStore'
import { beforeEach, describe, expect, it } from 'vitest'
import { APP_SHELL_ACTIONS, useAppShellStore } from '../useAppShellStore'

describe('useAppShellStore', () => {
  beforeEach(() => {
    useAppShellStore.setState(useAppShellStore.getInitialState())
  })

  it('starts on Generate with model search closed', () => {
    expect(useAppShellStore.getState()).toEqual({
      activeView: AppView.GENERATE,
      isModelSearchOpen: false
    })
  })

  it('switches views', () => {
    APP_SHELL_ACTIONS.setView(AppView.LOGS)
    expect(useAppShellStore.getState().activeView).toBe(AppView.LOGS)
  })

  it('opens Settings on a given section', () => {
    APP_SHELL_ACTIONS.openSettings(SettingsTab.MEMORY)

    expect(useAppShellStore.getState().activeView).toBe(AppView.SETTINGS)
    expect(useSettingsStore.getState().selectedTab).toBe(SettingsTab.MEMORY)
  })

  it('opens and closes model search', () => {
    APP_SHELL_ACTIONS.setModelSearchOpen(true)
    expect(useAppShellStore.getState().isModelSearchOpen).toBe(true)

    APP_SHELL_ACTIONS.setModelSearchOpen(false)
    expect(useAppShellStore.getState().isModelSearchOpen).toBe(false)
  })
})
