import { create } from 'zustand'

/** Which phase-1 overlays and panels the rail has open. Not persisted. */
export interface AppShellState {
  isModelSearchOpen: boolean
  isHistoryOpen: boolean
  isLogsOpen: boolean
}

export const useAppShellStore = create<AppShellState>()(() => ({
  isModelSearchOpen: false,
  isHistoryOpen: false,
  isLogsOpen: false
}))

export const APP_SHELL_ACTIONS = {
  setModelSearchOpen: (isModelSearchOpen: boolean) =>
    useAppShellStore.setState({ isModelSearchOpen }),
  setLogsOpen: (isLogsOpen: boolean) =>
    useAppShellStore.setState({ isLogsOpen }),
  toggleHistory: () =>
    useAppShellStore.setState({
      isHistoryOpen: !useAppShellStore.getState().isHistoryOpen
    })
}
