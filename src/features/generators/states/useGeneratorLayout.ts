import { useGeneratorPhotoviewStore } from '@/features/generator-photoview/states/useGeneratorPhotoviewStore'
import { useModelLoadProgressStore } from '@/features/model-load-progress'
import { isEmpty } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { useMountedState } from 'react-use'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useGeneratorForm } from './useGeneratorForm'
import { useUseImageGenerationStore } from './useImageGenerationResponseStores'

export const useGeneratorLayout = () => {
  const isMounted = useMountedState()
  const { methods } = useGeneratorForm()
  const progress = useModelLoadProgressStore((state) => state.progress)
  const isGenerating = useGenerationStatusStore((state) => state.isGenerating)
  const items = useUseImageGenerationStore((state) => state.items)
  const isPhotoviewOpen = useGeneratorPhotoviewStore((state) => state.isOpen)
  const closePhotoview = useGeneratorPhotoviewStore(
    (state) => state.closePhotoview
  )

  const canMountPhotoview = !isGenerating && !isEmpty(items)

  useEffect(() => {
    if (!isPhotoviewOpen) return
    if (canMountPhotoview) return
    closePhotoview()
  }, [canMountPhotoview, closePhotoview, isPhotoviewOpen])

  return {
    isMounted: isMounted(),
    methods,
    loadingMessage: progress?.message,
    canMountPhotoview
  }
}
