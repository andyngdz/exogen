import { useEffect } from 'react'
import { UPDATER_ACTIONS } from './useUpdaterStore'

/** Mirrors the main process updater state into the store for the app's lifetime. */
export const useUpdateStateWatcher = () => {
  useEffect(() => {
    const api = globalThis.window.electronAPI
    if (!api) return

    return api.updater.onState(UPDATER_ACTIONS.setUpdaterState)
  }, [])
}
