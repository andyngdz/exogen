import { useCallback, useMemo, useState } from 'react'

import { imageInputService } from '../services'
import { useImageDropzone } from './useImageDropzone'
import { useImageFilePicker } from './useImageFilePicker'
import { useImagePaste } from './useImagePaste'

interface UseImageInputParams {
  hasImage: boolean
  onImageDataUrl: (dataUrl: string) => void
  labels?: {
    empty: string
    filled: string
  }
}

export const useImageInput = ({
  hasImage,
  onImageDataUrl,
  labels = {
    empty: 'Drop an image here, paste, or upload',
    filled: 'Input image'
  }
}: UseImageInputParams) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | undefined>(undefined)

  const dropzoneLabel = useMemo(() => {
    if (hasImage) return labels.filled
    return labels.empty
  }, [hasImage, labels.empty, labels.filled])

  const loadFile = useCallback(
    async (file: File) => {
      if (!imageInputService.isImageFile(file)) {
        setLastError('Only image files are supported')
        return
      }

      setLastError(undefined)
      setIsLoading(true)
      try {
        const dataUrl = await imageInputService.fileToDataUrl(file)
        onImageDataUrl(dataUrl)
      } finally {
        setIsLoading(false)
      }
    },
    [onImageDataUrl]
  )

  const clearLastError = useCallback(() => {
    setLastError(undefined)
  }, [])

  const onFile = useCallback(
    (file: File) => {
      void loadFile(file)
    },
    [loadFile]
  )

  const { onFileChange } = useImageFilePicker({ onFile })

  const { isDragActive, onDrop, onDragEnter, onDragOver, onDragLeave } =
    useImageDropzone({ onFile })

  useImagePaste({ onFile })

  return {
    isDragActive,
    isLoading,
    dropzoneLabel,
    lastError,
    clearLastError,
    onFileChange,
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave
  }
}
