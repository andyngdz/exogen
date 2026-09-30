import { useSocketConnectionWatcher } from '@/cores/sockets'
import { AppView } from '@/features/app-shell/types'
import { useModelLoadProgress } from '@/features/model-load-progress/states'
import { APP_SHELL_ACTIONS, useAppShellStore } from './useAppShellStore'

/**
 * Mounts the app-wide socket watchers and binds the view and overlays the rail
 * opens. The model load subscription lives here so progress keeps updating
 * whatever view is open.
 */
export const useAppShell = () => {
  useSocketConnectionWatcher()
  useModelLoadProgress()

  const activeView = useAppShellStore((state) => state.activeView)
  const isModelSearchOpen = useAppShellStore((state) => state.isModelSearchOpen)
  const isLogsOpen = useAppShellStore((state) => state.isLogsOpen)

  return {
    activeView,
    isGenerateView: activeView === AppView.GENERATE,
    isModelSearchOpen,
    onModelSearchOpenChange: APP_SHELL_ACTIONS.setModelSearchOpen,
    isLogsOpen,
    onLogsOpenChange: APP_SHELL_ACTIONS.setLogsOpen
  }
}
