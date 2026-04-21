import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { isEmpty } from 'es-toolkit/compat'

import {
  useGenerationStatusStore,
  useUseImageGenerationStore
} from '@/features/generators'

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
        set(() => {
          const { isGenerating } = useGenerationStatusStore.getState()
          if (isGenerating) return store.getState()

          const { items } = useUseImageGenerationStore.getState()
          const item = items[index]
          if (!item || isEmpty(item.path)) return store.getState()

          return {
            isOpen: true,
            currentIndex: Math.max(0, index)
          }
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
