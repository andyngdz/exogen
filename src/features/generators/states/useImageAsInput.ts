import { dataUrlService } from '@/services/data-url'
import { GeneratorMode } from '@/types'
import { toast } from '@heroui/react'
import { useCallback, useState } from 'react'
import { useGeneratorModeStore } from './useGeneratorModeStore'
import { useImage2ImageConfigStore } from './useImage2ImageConfigStore'

/**
 * Loads a generated image as the image to image input and switches to image
 * mode. Shared by the stage toolbar and the full-screen viewer.
 */
export const useImageAsInput = () => {
  const setInitImageBase64 = useImage2ImageConfigStore(
    (state) => state.setInitImageBase64
  )
  const setMode = useGeneratorModeStore((state) => state.setMode)
  const [isUsingAsInput, setIsUsingAsInput] = useState(false)

  const loadAsInput = useCallback(
    async (imageUrl: string) => {
      setIsUsingAsInput(true)

      try {
        const dataUrl = await dataUrlService.fetchUrlToDataUrl(imageUrl)
        setInitImageBase64(dataUrl)
        setMode(GeneratorMode.IMAGE_2_IMAGE)
        return true
      } catch (error: unknown) {
        toast.danger('Use as input', {
          description:
            error instanceof Error
              ? error.message
              : 'Failed to use image as input'
        })
        return false
      } finally {
        setIsUsingAsInput(false)
      }
    },
    [setInitImageBase64, setMode]
  )

  return { isUsingAsInput, loadAsInput }
}
