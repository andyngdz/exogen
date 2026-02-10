'use client'

import { addToast } from '@heroui/react'
import { useCallback, useState } from 'react'

import { imageInputService } from '../services'

interface UseImageInputControllerParams {
  onImageDataUrl: (dataUrl: string) => void
}

export const useImageInputController = ({
  onImageDataUrl
}: UseImageInputControllerParams) => {
  const [isLoading, setIsLoading] = useState(false)

  const onFile = useCallback(
    async (file: File) => {
      if (!imageInputService.isImageFile(file)) {
        addToast({
          title: 'Input image',
          description: 'Only image files are supported',
          color: 'danger'
        })
        return
      }

      setIsLoading(true)

      try {
        const dataUrl = await imageInputService.fileToDataUrl(file)
        onImageDataUrl(dataUrl)
      } catch (error: unknown) {
        addToast({
          title: 'Input image',
          description:
            error instanceof Error ? error.message : 'Failed to read file',
          color: 'danger'
        })
      } finally {
        setIsLoading(false)
      }
    },
    [onImageDataUrl]
  )

  return {
    isLoading,
    onFile
  }
}
