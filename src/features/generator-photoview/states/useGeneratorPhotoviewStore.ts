import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UseGeneratorPhotoviewStore {
  isOpen: boolean
  currentIndex: number
  openPhotoview: (index: number) => void
  setCurrentIndex: (index: number) => void
  closePhotoview: VoidFunction
}

export const useGeneratorPhotoviewStore = create<UseGeneratorPhotoviewStore>()(
  devtools(
    (set, _, store) => ({
      isOpen: false,
      currentIndex: 0,
      openPhotoview: (index) =>
        set({
          isOpen: true,
          currentIndex: Math.max(0, index)
        }),
      setCurrentIndex: (index) =>
        set({
          currentIndex: Math.max(0, index)
        }),
      closePhotoview: () => set(store.getInitialState())
    }),
    { name: 'generator-photoview' }
  )
)
