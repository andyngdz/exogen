import { reconnectSocket } from '@/cores/sockets'
import { APP_SHELL_ACTIONS } from '@/features/app-shell/states/useAppShellStore'
import { SettingsTab } from '@/features/settings/states/useSettingsStore'

/** Shell actions the stage panels offer: logs, model search, memory settings, reconnect. */
export const useStageActions = () => {
  return {
    onOpenLogs: () => APP_SHELL_ACTIONS.setLogsOpen(true),
    onOpenModelSearch: () => APP_SHELL_ACTIONS.setModelSearchOpen(true),
    onOpenMemorySettings: () =>
      APP_SHELL_ACTIONS.openSettings(SettingsTab.MEMORY),
    onRetryConnection: reconnectSocket
  }
}
