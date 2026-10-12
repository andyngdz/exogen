import { useSocketConnectionWatcher } from '@/cores/sockets'
import { AppView } from '@/features/app-shell/types'
import { useModelLoadProgress } from '@/features/model-load-progress/states'
import { useUpdateStateWatcher } from '@/features/settings/states/useUpdateStateWatcher'
import { useAppShellStore } from './useAppShellStore'

/**
 * Mounts the app-wide watchers and reads the view the rail opened. The model
 * load and updater subscriptions live here so they keep updating whatever
 * view is open.
 */
export const useAppShell = () => {
  useSocketConnectionWatcher()
  useModelLoadProgress()
  useUpdateStateWatcher()

  const activeView = useAppShellStore((state) => state.activeView)

  return {
    activeView,
    isGenerateView: activeView === AppView.GENERATE
  }
}
