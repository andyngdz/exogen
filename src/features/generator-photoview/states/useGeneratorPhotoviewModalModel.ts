import { useBackendUrl } from '@/cores/backend-initialization'
import { useDownloadImages } from '@/features/generator-previewers/states'
import {
  useGeneratorModeStore,
  useImage2ImageConfigStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { GeneratorMode } from '@/types'
import { toast } from '@heroui/react'
import { useCallback, useState } from 'react'

import { dataUrlService } from '@/services/data-url'

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
  const setInitImageBase64 = useImage2ImageConfigStore(
    (state) => state.setInitImageBase64
  )
  const setMode = useGeneratorModeStore((state) => state.setMode)
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
      toast.danger('Use as input', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to use image as input'
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
