import { AppView } from '@/features/app-shell/types'
import { APP_SHELL_ACTIONS, useAppShellStore } from './useAppShellStore'

/** Rail state: which view is open, and the items not yet moved to a view. */
export const useAppRail = () => {
  const activeView = useAppShellStore((state) => state.activeView)
  const isHistoryOpen = useAppShellStore((state) => state.isHistoryOpen)

  return {
    activeView,
    isHistoryOpen,
    onOpenView: APP_SHELL_ACTIONS.setView,
    onOpenModels: () => APP_SHELL_ACTIONS.setModelSearchOpen(true),
    onToggleHistory: APP_SHELL_ACTIONS.toggleHistory,
    onOpenSettings: () => APP_SHELL_ACTIONS.setView(AppView.SETTINGS)
  }
}
