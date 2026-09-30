import { reconnectSocket } from '@/cores/sockets'
import { APP_SHELL_ACTIONS } from '@/features/app-shell/states/useAppShellStore'
import { SettingsTab, useSettingsStore } from '@/features/settings'

/** Shell actions the stage panels offer: logs, model search, memory settings, reconnect. */
export const useStageActions = () => {
  const openModal = useSettingsStore((state) => state.openModal)

  return {
    onOpenLogs: () => APP_SHELL_ACTIONS.setLogsOpen(true),
    onOpenModelSearch: () => APP_SHELL_ACTIONS.setModelSearchOpen(true),
    onOpenMemorySettings: () => openModal(SettingsTab.MEMORY),
    onRetryConnection: reconnectSocket
  }
}
