import { create } from 'zustand'

/** Whether the backend log drawer is open. Not persisted. */
export interface BackendLogDrawerState {
  isOpen: boolean
}

export const useBackendLogDrawerStore = create<BackendLogDrawerState>()(() => ({
  isOpen: false
}))

export const BACKEND_LOG_DRAWER_ACTIONS = {
  open: () => useBackendLogDrawerStore.setState({ isOpen: true }),
  setOpen: (isOpen: boolean) => useBackendLogDrawerStore.setState({ isOpen })
}
