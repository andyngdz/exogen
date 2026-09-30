import { APP_SHELL_ACTIONS, useAppShellStore } from './useAppShellStore'

/** Rail state: which view is open, and how to switch to another. */
export const useAppRail = () => {
  const activeView = useAppShellStore((state) => state.activeView)

  return { activeView, onOpenView: APP_SHELL_ACTIONS.setView }
}
