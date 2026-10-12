import { UpdaterState } from '@types'
import { create } from 'zustand'

/** The main process updater state, plus whether the user said Later. Not persisted. */
export interface UpdaterStoreState extends UpdaterState {
  isDismissed: boolean
}

export const useUpdaterStore = create<UpdaterStoreState>()(() => ({
  isDismissed: false
}))

export const UPDATER_ACTIONS = {
  setUpdaterState: (state: UpdaterState) => useUpdaterStore.setState(state),
  dismiss: () => useUpdaterStore.setState({ isDismissed: true })
}

/** A downloaded update the user has not put off for this session. */
export const useHasPendingUpdate = () =>
  useUpdaterStore(
    (state) => Boolean(state.downloadedVersion) && !state.isDismissed
  )
