import { beforeEach, describe, expect, it } from 'vitest'
import {
  SETTINGS_ACTIONS,
  SettingsTab,
  useSettingsStore
} from '../useSettingsStore'

describe('useSettingsStore', () => {
  beforeEach(() => {
    SETTINGS_ACTIONS.reset()
  })

  it('starts with the safety check on and the General section', () => {
    expect(useSettingsStore.getState()).toEqual({
      values: { safety_check_enabled: true },
      selectedTab: SettingsTab.GENERAL
    })
  })

  it('stores new values and the selected section', () => {
    SETTINGS_ACTIONS.setValues({ safety_check_enabled: false })
    SETTINGS_ACTIONS.setSelectedTab(SettingsTab.UPDATES)

    expect(useSettingsStore.getState()).toEqual({
      values: { safety_check_enabled: false },
      selectedTab: SettingsTab.UPDATES
    })
  })

  it('resets to the initial state', () => {
    SETTINGS_ACTIONS.setValues({ safety_check_enabled: false })

    SETTINGS_ACTIONS.reset()

    expect(useSettingsStore.getState().values.safety_check_enabled).toBe(true)
  })
})
