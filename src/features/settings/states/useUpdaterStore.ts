import { selectHasPendingUpdate } from '@/features/settings/services/updater'
import { UpdaterState } from '@types'
import { create } from 'zustand'

/** The main process updater state, the app version, and whether the user said Later. Not persisted. */
export interface UpdaterStoreState extends UpdaterState {
  isDismissed: boolean
  appVersion?: string
}

export const useUpdaterStore = create<UpdaterStoreState>()(() => ({
  isDismissed: false
}))

export const UPDATER_ACTIONS = {
  setUpdaterState: (state: UpdaterState) => useUpdaterStore.setState(state),
  dismiss: () => useUpdaterStore.setState({ isDismissed: true }),
  setAppVersion: (appVersion: string) =>
    useUpdaterStore.setState({ appVersion })
}

/** A downloaded update the user has not put off for this session. */
export const useHasPendingUpdate = () => useUpdaterStore(selectHasPendingUpdate)
