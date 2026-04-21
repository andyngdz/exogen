import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UseHistoryPhotoviewStore {
  isOpen: boolean
  currentHistoryId: number | null
  openPhotoview: (historyId: number) => void
  closePhotoview: VoidFunction
}

export const useHistoryPhotoviewStore = create<UseHistoryPhotoviewStore>()(
  devtools(
    (set, _, store) => ({
      isOpen: false,
      currentHistoryId: null,
      openPhotoview: (historyId) =>
        set({ isOpen: true, currentHistoryId: historyId }),
      closePhotoview: () => set(store.getInitialState())
    }),
    { name: 'history-photoview' }
  )
)
