import { useGeneratorPhotoviewStore } from '@/features/generator-photoview/states/useGeneratorPhotoviewStore'
import { isEmpty } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { useMountedState } from 'react-use'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useGeneratorForm } from './useGeneratorForm'
import { useUseImageGenerationStore } from './useImageGenerationResponseStores'

export const useGeneratorLayout = () => {
  const isMounted = useMountedState()
  const { methods } = useGeneratorForm()
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
    canMountPhotoview
  }
}
