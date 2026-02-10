import { useBackendUrl } from '@/cores/backend-initialization'
import { useDownloadImages } from '@/features/generator-previewers/states'
import {
  useGeneratorModeStore,
  useImage2ImageConfigStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { GeneratorMode } from '@/types'
import { addToast } from '@heroui/react'
import { useCallback, useState } from 'react'

import { dataUrlService } from '@/services/data-url'

import { useGeneratorPhotoviewStore } from './useGeneratorPhotoviewStore'

export const useGeneratorPhotoviewModalModel = () => {
  const baseURL = useBackendUrl()
  const { isOpen, currentIndex, closePhotoview } = useGeneratorPhotoviewStore()
  const { items } = useUseImageGenerationStore()
  const { onDownloadImage } = useDownloadImages()
  const { setInitImageBase64 } = useImage2ImageConfigStore()
  const { setMode } = useGeneratorModeStore()
  const [isUsingAsInput, setIsUsingAsInput] = useState(false)

  const safeIndex = Math.min(Math.max(0, currentIndex), items.length - 1)
  const imageUrl = `${baseURL}/${items[safeIndex].path}`

  const onDownload = useCallback(() => {
    onDownloadImage(imageUrl)
  }, [imageUrl, onDownloadImage])

  const onUseAsInput = useCallback(async () => {
    setIsUsingAsInput(true)

    try {
      const dataUrl = await dataUrlService.fetchUrlToDataUrl(imageUrl)
      setInitImageBase64(dataUrl)
      setMode(GeneratorMode.IMAGE_2_IMAGE)
      closePhotoview()
    } catch (error: unknown) {
      addToast({
        title: 'Use as input',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to use image as input',
        color: 'danger'
      })
    } finally {
      setIsUsingAsInput(false)
    }
  }, [closePhotoview, imageUrl, setInitImageBase64, setMode])

  return {
    isOpen,
    closePhotoview,
    safeIndex,
    isUsingAsInput,
    onDownload,
    onUseAsInput
  }
}
