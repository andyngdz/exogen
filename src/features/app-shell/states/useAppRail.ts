import { useHasPendingUpdate } from '@/features/settings/states/useUpdaterStore'
import { APP_SHELL_ACTIONS, useAppShellStore } from './useAppShellStore'

/** Rail state: which view is open, whether Settings has an update waiting, and how to switch views. */
export const useAppRail = () => {
  const activeView = useAppShellStore((state) => state.activeView)
  const hasPendingUpdate = useHasPendingUpdate()

  return { activeView, hasPendingUpdate, onOpenView: APP_SHELL_ACTIONS.setView }
}
