'use client'

import { useEffect } from 'react'
import { UPDATER_ACTIONS, useUpdaterStore } from './useUpdaterStore'

/** Loads the packaged app's version into the updater store; the dev build has none. */
export const useLoadAppVersion = () => {
  useEffect(() => {
    const api = globalThis.window.electronAPI
    if (!api) return

    api.app.getVersion().then(UPDATER_ACTIONS.setAppVersion)
  }, [])
}

/** The app version, or "Development Build" until main reports one. */
export const useAppVersion = () => {
  const appVersion = useUpdaterStore((state) => state.appVersion)

  return appVersion ?? 'Development Build'
}
