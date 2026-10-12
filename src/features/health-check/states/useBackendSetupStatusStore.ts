import type { BackendStatusPayload } from '@types'
import { uniqueId } from 'es-toolkit/compat'
import { create } from 'zustand'

export const MAX_BACKEND_STATUS_MESSAGES = 100

export interface BackendSetupStatusEntry extends BackendStatusPayload {
  id: string
  timestamp: number
}

/** The setup messages of the current run, newest last. */
export interface BackendSetupStatusState {
  entries: BackendSetupStatusEntry[]
}

export const useBackendSetupStatusStore = create<BackendSetupStatusState>()(
  () => ({ entries: [] })
)

export const BACKEND_SETUP_STATUS_ACTIONS = {
  /** Appends one message, keeping the newest MAX_BACKEND_STATUS_MESSAGES. */
  addEntry: (payload: BackendStatusPayload) => {
    useBackendSetupStatusStore.setState((state) => ({
      entries: [
        ...state.entries,
        { ...payload, id: uniqueId(), timestamp: Date.now() }
      ].slice(-MAX_BACKEND_STATUS_MESSAGES)
    }))
  },
  clear: () => useBackendSetupStatusStore.setState({ entries: [] })
}
