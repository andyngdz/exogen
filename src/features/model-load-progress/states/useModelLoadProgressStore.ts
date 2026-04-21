import { ModelLoadProgressResponse } from '@/cores/sockets'
import { create } from 'zustand'

interface State {
  model_id?: string
  progress?: ModelLoadProgressResponse
}

interface Actions {
  onUpdateProgress: (progress: ModelLoadProgressResponse) => void
  onSetModelId: (model_id: string) => void
  reset: VoidFunction
}

export const useModelLoadProgressStore = create<State & Actions>()(
  (set, _get, store) => ({
    model_id: undefined,
    progress: undefined,

    onUpdateProgress: (progress) => set({ progress }),
    onSetModelId: (model_id) => set({ model_id }),
    reset: () => set(store.getInitialState())
  })
)
