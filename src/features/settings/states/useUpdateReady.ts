'use client'

import { UPDATER_ACTIONS, useUpdaterStore } from './useUpdaterStore'

/** The downloaded update waiting for a restart, with Later and Install. */
export const useUpdateReady = () => {
  const version = useUpdaterStore((state) => state.downloadedVersion)

  const onInstall = async () => {
    await globalThis.window.electronAPI.updater.installUpdate()
  }

  return {
    version,
    onLater: UPDATER_ACTIONS.dismiss,
    onInstall: () => void onInstall()
  }
}
