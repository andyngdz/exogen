import { ModelFamily } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ModelSelectorState {
  selected_model_id: string
  loaded_model_family: ModelFamily
  setSelectedModelId: (id: string) => void
  setLoadedModelFamily: (family: ModelFamily) => void
}

export const useModelSelectorStore = create(
  persist<
    ModelSelectorState,
    [],
    [],
    Pick<ModelSelectorState, 'selected_model_id'>
  >(
    (set) => ({
      selected_model_id: '',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: (selected_model_id) => set({ selected_model_id }),
      setLoadedModelFamily: (loaded_model_family) =>
        set({ loaded_model_family })
    }),
    {
      name: 'model-selector',
      partialize: (state) => ({
        selected_model_id: state.selected_model_id
      })
    }
  )
)
