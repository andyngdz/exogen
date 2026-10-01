import { AppView } from '@/features/app-shell/types'
import {
  SETTINGS_ACTIONS,
  SettingsTab
} from '@/features/settings/states/useSettingsStore'
import { create } from 'zustand'

/** Which rail view the editor shows. Not persisted. */
export interface AppShellState {
  activeView: AppView
}

export const useAppShellStore = create<AppShellState>()(() => ({
  activeView: AppView.GENERATE
}))

export const APP_SHELL_ACTIONS = {
  setView: (activeView: AppView) => useAppShellStore.setState({ activeView }),
  openSettings: (tab = SettingsTab.GENERAL) => {
    SETTINGS_ACTIONS.setSelectedTab(tab)
    useAppShellStore.setState({ activeView: AppView.SETTINGS })
  }
}
