'use client'

import { useEffect } from 'react'
import { BACKEND_SETUP_STATUS_ACTIONS } from './useBackendSetupStatusStore'

/** Collects the setup messages main sends while this screen is mounted. */
export const useBackendSetupStatus = () => {
  useEffect(() => {
    const api = globalThis.window.electronAPI

    if (!api.onBackendSetupStatus) {
      return
    }

    const unsubscribe = api.onBackendSetupStatus(
      BACKEND_SETUP_STATUS_ACTIONS.addEntry
    )

    return () => {
      unsubscribe()
      BACKEND_SETUP_STATUS_ACTIONS.clear()
    }
  }, [])
}
