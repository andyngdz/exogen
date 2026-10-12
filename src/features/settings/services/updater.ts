import type { UpdaterStoreState } from '@/features/settings/states/useUpdaterStore'

/** Store selector: a downloaded update the user has not put off for this session. */
export const selectHasPendingUpdate = (state: UpdaterStoreState) =>
  Boolean(state.downloadedVersion) && !state.isDismissed
