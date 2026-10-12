import { useBackendUrl } from '@/cores/backend-initialization'
import { useDownloadImages } from '@/features/generator-previewers/states'
import {
  useImageAsInput,
  useLastRunStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { useCallback } from 'react'

import { photoviewService } from '@/features/generator-photoview/services/photoview'

import { useGeneratorPhotoviewStore } from './useGeneratorPhotoviewStore'

export const useGeneratorPhotoviewModalModel = () => {
  const baseURL = useBackendUrl()
  const isOpen = useGeneratorPhotoviewStore((state) => state.isOpen)
  const currentIndex = useGeneratorPhotoviewStore((state) => state.currentIndex)
  const closePhotoview = useGeneratorPhotoviewStore(
    (state) => state.closePhotoview
  )
  const items = useUseImageGenerationStore((state) => state.items)
  const { onDownloadImage } = useDownloadImages()
  const prompt = useLastRunStore((state) => state.prompt)
  const seed = useLastRunStore((state) => state.seed)
  const { isUsingAsInput, loadAsInput } = useImageAsInput()

  const safeIndex = Math.min(Math.max(0, currentIndex), items.length - 1)
  const imageUrl = `${baseURL}/${items[safeIndex].path}`

  const onDownload = useCallback(() => {
    void onDownloadImage(imageUrl)
  }, [imageUrl, onDownloadImage])

  const onUseAsInput = useCallback(async () => {
    const isLoaded = await loadAsInput(imageUrl)
    if (isLoaded) closePhotoview()
  }, [closePhotoview, imageUrl, loadAsInput])

  return {
    isOpen,
    closePhotoview,
    safeIndex,
    total: items.length,
    prompt,
    seedLabel: photoviewService.toSeedLabel(seed),
    isUsingAsInput,
    onDownload,
    onUseAsInput
  }
}
