import { ModelFamily } from '@/types'
import { create } from 'zustand'

/**
 * Size preset state that must outlive the Basic tab: tabs unmount when hidden,
 * and a model can finish loading while another tab is open.
 */
export interface ImageSizeState {
  /** Last known family; UNKNOWN only until the first model finishes loading. */
  family: ModelFamily
  /** True once the user picks Custom, so a swap or typed size stays Custom. */
  isCustomChosen: boolean
}

export const useImageSizeStore = create<ImageSizeState>()(() => ({
  family: ModelFamily.UNKNOWN,
  isCustomChosen: false
}))

export const IMAGE_SIZE_ACTIONS = {
  setFamily: (family: ModelFamily) => useImageSizeStore.setState({ family }),
  setCustomChosen: (isCustomChosen: boolean) =>
    useImageSizeStore.setState({ isCustomChosen })
}
