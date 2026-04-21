import { DownloadStepProgressResponse } from '@/cores/sockets'
import { create } from 'zustand'

export interface UseDownloadWatcherStore {
  model_id?: string
  step?: DownloadStepProgressResponse

  onUpdateStep: (step: DownloadStepProgressResponse) => void
  onSetModelId: (model_id: string) => void
  onResetStep: VoidFunction
  onResetModelId: VoidFunction
}

export const useDownloadWatcherStore = create<UseDownloadWatcherStore>(
  (set) => ({
    onUpdateStep: (step) => set({ step }),
    onSetModelId: (model_id: string) => set({ model_id }),
    onResetStep: () => set({ step: undefined }),
    onResetModelId: () => set({ model_id: undefined })
  })
)
