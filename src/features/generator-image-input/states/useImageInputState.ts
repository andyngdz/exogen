import { useImage2ImageConfigStore } from '@/features/generators'
import { useImageInputController } from './useImageInputController'

export const useImageInputState = () => {
  const initImageBase64 = useImage2ImageConfigStore(
    (state) => state.initImageBase64
  )
  const setInitImageBase64 = useImage2ImageConfigStore(
    (state) => state.setInitImageBase64
  )
  const clearInitImageBase64 = useImage2ImageConfigStore(
    (state) => state.clearInitImageBase64
  )
  const { isLoading, onFile } = useImageInputController({
    onImageDataUrl: setInitImageBase64
  })

  return {
    initImageBase64,
    hasImage: !!initImageBase64,
    isLoading,
    onFile,
    onRemove: clearInitImageBase64
  }
}
