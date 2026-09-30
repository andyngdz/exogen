import { AppView } from '@/features/app-shell/types'
import {
  SettingsTab,
  useSettingsStore
} from '@/features/settings/states/useSettingsStore'
import { create } from 'zustand'

/** Which rail view the editor shows, and the overlays still opened from it. Not persisted. */
export interface AppShellState {
  activeView: AppView
  isModelSearchOpen: boolean
}

export const useAppShellStore = create<AppShellState>()(() => ({
  activeView: AppView.GENERATE,
  isModelSearchOpen: false
}))

export const APP_SHELL_ACTIONS = {
  setView: (activeView: AppView) => useAppShellStore.setState({ activeView }),
  openSettings: (tab = SettingsTab.GENERAL) => {
    useSettingsStore.getState().setSelectedTab(tab)
    useAppShellStore.setState({ activeView: AppView.SETTINGS })
  },
  setModelSearchOpen: (isModelSearchOpen: boolean) =>
    useAppShellStore.setState({ isModelSearchOpen })
}
