'use client'

import { ValueChanged } from '@/types'
import { toast } from '@heroui/react'
import { useCallback, useState } from 'react'

import { imageInputService } from '@/features/generator-image-input/services'

interface UseImageInputControllerParams {
  onImageDataUrl: ValueChanged<string>
}

export const useImageInputController = ({
  onImageDataUrl
}: UseImageInputControllerParams) => {
  const [isLoading, setIsLoading] = useState(false)

  const onFile = useCallback(
    async (file: File) => {
      if (!imageInputService.isImageFile(file)) {
        toast.danger('Input image', {
          description: 'Only image files are supported'
        })
        return
      }

      setIsLoading(true)

      try {
        const dataUrl = await imageInputService.fileToDataUrl(file)
        onImageDataUrl(dataUrl)
      } catch (error: unknown) {
        toast.danger('Input image', {
          description:
            error instanceof Error ? error.message : 'Failed to read file'
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
