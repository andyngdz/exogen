import { ModelFamily } from '@/types'
import { find, get, values } from 'es-toolkit/compat'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const IMAGE_SIZE_STORAGE_KEY = 'generator-image-size'

/**
 * Size preset state that must outlive the Basic tab: tabs unmount when hidden,
 * and a model can finish loading while another tab is open.
 */
export interface ImageSizeState {
  /** Last loaded family, kept across launches; UNKNOWN until the first load. */
  family: ModelFamily
  /** True once the user picks Custom, so a swap or typed size stays Custom. */
  isCustomChosen: boolean
}

const INITIAL_IMAGE_SIZE: ImageSizeState = {
  family: ModelFamily.UNKNOWN,
  isCustomChosen: false
}

// The family is saved so a saved size maps to its preset on launch, before the
// model finishes loading again.
export const useImageSizeStore = create<ImageSizeState>()(
  persist(() => INITIAL_IMAGE_SIZE, {
    name: IMAGE_SIZE_STORAGE_KEY,
    partialize: (state) => ({ family: state.family }),
    // A family the app no longer knows would size presets as NaN.
    merge: (persisted, current) => {
      const savedFamily = get(persisted, 'family')
      const family = find(values(ModelFamily), (item) => item === savedFamily)
      if (!family) return current

      return { ...current, family }
    }
  })
)

export const IMAGE_SIZE_ACTIONS = {
  setFamily: (family: ModelFamily) => useImageSizeStore.setState({ family }),
  setCustomChosen: (isCustomChosen: boolean) =>
    useImageSizeStore.setState({ isCustomChosen })
}
