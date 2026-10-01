import { SettingFormValues } from '@/features/settings/types'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export enum SettingsTab {
  GENERAL = 'general',
  MEMORY = 'memory',
  MODELS = 'models',
  UPDATES = 'updates'
}

const SETTINGS_STORAGE_KEY = 'app-config'

export interface SettingsState {
  values: SettingFormValues
  selectedTab: SettingsTab
}

const INITIAL_SETTINGS: SettingsState = {
  values: { safety_check_enabled: true },
  selectedTab: SettingsTab.GENERAL
}

const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(() => INITIAL_SETTINGS, {
      name: SETTINGS_STORAGE_KEY,
      partialize: (state) => ({ values: state.values })
    })
  )
)

const SETTINGS_ACTIONS = {
  setValues: (values: SettingFormValues) =>
    useSettingsStore.setState({ values }),
  setSelectedTab: (selectedTab: SettingsTab) =>
    useSettingsStore.setState({ selectedTab }),
  reset: () => useSettingsStore.setState(useSettingsStore.getInitialState())
}

export { SETTINGS_ACTIONS, useSettingsStore }
