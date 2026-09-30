import { APP_SHELL_ACTIONS } from '@/features/app-shell/states/useAppShellStore'
import { SettingsTab } from '@/features/settings/states/useSettingsStore'

export const useManageDownloadedModel = () => {
  const onManageModel = () => {
    APP_SHELL_ACTIONS.setModelSearchOpen(false)
    APP_SHELL_ACTIONS.openSettings(SettingsTab.MODELS)
  }

  return { onManageModel }
}
