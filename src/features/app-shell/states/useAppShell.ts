import { useSocketConnectionWatcher } from '@/cores/sockets'
import { AppView } from '@/features/app-shell/types'
import { useModelLoadProgress } from '@/features/model-load-progress/states'
import { useAppShellStore } from './useAppShellStore'

/**
 * Mounts the app-wide socket watchers and reads the view the rail opened.
 * The model load subscription lives here so progress keeps updating whatever
 * view is open.
 */
export const useAppShell = () => {
  useSocketConnectionWatcher()
  useModelLoadProgress()

  const activeView = useAppShellStore((state) => state.activeView)

  return {
    activeView,
    isGenerateView: activeView === AppView.GENERATE
  }
}
