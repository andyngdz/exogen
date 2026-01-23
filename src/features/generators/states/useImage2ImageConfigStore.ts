import { Image2ImageResizeMode } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface Image2ImageConfigStore {
  initImageBase64?: string
  strength: number
  resizeMode: Image2ImageResizeMode
  setInitImageBase64: (base64: string) => void
  clearInitImageBase64: () => void
  setStrength: (strength: number) => void
  setResizeMode: (mode: Image2ImageResizeMode) => void
  reset: () => void
}

export const useImage2ImageConfigStore = create<Image2ImageConfigStore>()(
  immer((set, _get, store) => ({
    strength: 0.75,
    resizeMode: Image2ImageResizeMode.RESIZE,
    setInitImageBase64: (base64: string) => {
      set((draft) => {
        draft.initImageBase64 = base64
      })
    },
    clearInitImageBase64: () => {
      set((draft) => {
        draft.initImageBase64 = undefined
      })
    },
    setStrength: (strength: number) => {
      set((draft) => {
        draft.strength = strength
      })
    },
    setResizeMode: (mode: Image2ImageResizeMode) => {
      set((draft) => {
        draft.resizeMode = mode
      })
    },
    reset: () => set(store.getInitialState())
  }))
)
