import { GeneratorMode } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface GeneratorModeStore {
  mode: GeneratorMode
  setMode: (mode: GeneratorMode) => void
  reset: () => void
}

export const useGeneratorModeStore = create<GeneratorModeStore>()(
  immer((set, _get, store) => ({
    mode: GeneratorMode.TEXT_2_IMAGE,
    setMode: (mode: GeneratorMode) => {
      set((draft) => {
        draft.mode = mode
      })
    },
    reset: () => set(store.getInitialState())
  }))
)
