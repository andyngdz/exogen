import { useSocketConnectionWatcher } from '@/cores/sockets'
import { useModelLoadProgress } from '@/features/model-load-progress/states'
import { useSettingsModal } from '@/features/settings/states/useSettingsModal'
import { APP_SHELL_ACTIONS, useAppShellStore } from './useAppShellStore'

/**
 * Mounts the app-wide socket watchers and binds the overlays the rail opens.
 * The model load subscription lives here so progress keeps updating whatever
 * the generator shows.
 */
export const useAppShell = () => {
  useSocketConnectionWatcher()
  useModelLoadProgress()

  const isModelSearchOpen = useAppShellStore((state) => state.isModelSearchOpen)
  const isLogsOpen = useAppShellStore((state) => state.isLogsOpen)
  const { isModalOpen, onOpenChange } = useSettingsModal()

  return {
    isModelSearchOpen,
    onModelSearchOpenChange: APP_SHELL_ACTIONS.setModelSearchOpen,
    isLogsOpen,
    onLogsOpenChange: APP_SHELL_ACTIONS.setLogsOpen,
    isSettingsOpen: isModalOpen,
    onSettingsOpenChange: onOpenChange
  }
}
