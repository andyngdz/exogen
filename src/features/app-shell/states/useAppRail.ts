import { useSettingsStore } from '@/features/settings/states/useSettingsStore'
import { APP_SHELL_ACTIONS, useAppShellStore } from './useAppShellStore'

/** Rail actions for phase 1: every item except Generate opens the existing UI. */
export const useAppRail = () => {
  const isHistoryOpen = useAppShellStore((state) => state.isHistoryOpen)
  const openSettings = useSettingsStore((state) => state.openModal)

  return {
    isHistoryOpen,
    onOpenModels: () => APP_SHELL_ACTIONS.setModelSearchOpen(true),
    onToggleHistory: APP_SHELL_ACTIONS.toggleHistory,
    onOpenLogs: () => APP_SHELL_ACTIONS.setLogsOpen(true),
    onOpenSettings: () => openSettings()
  }
}
