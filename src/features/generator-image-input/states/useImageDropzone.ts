import { useCallback, useState } from 'react'

import { imageInputService } from '../services'

export type ImageDropzoneDragEvent = {
  preventDefault: VoidFunction
}

export type ImageDropzoneDropEvent = {
  preventDefault: VoidFunction
  dataTransfer: {
    files: ArrayLike<File>
  }
}

interface UseImageDropzoneParams {
  onFile: (file: File) => Promise<void>
}

export const useImageDropzone = ({ onFile }: UseImageDropzoneParams) => {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDragActivate = useCallback((event: ImageDropzoneDragEvent) => {
    event.preventDefault()
    setIsDragActive(true)
  }, [])

  const onDragDeactivate = useCallback((event: ImageDropzoneDragEvent) => {
    event.preventDefault()
    setIsDragActive(false)
  }, [])

  const onDrop = useCallback(
    async (event: ImageDropzoneDropEvent) => {
      event.preventDefault()
      setIsDragActive(false)

      const file = imageInputService.firstFile(event.dataTransfer.files)
      if (!file) return

      await onFile(file)
    },
    [onFile]
  )

  return {
    isDragActive,
    onDrop,
    onDragEnter: onDragActivate,
    onDragOver: onDragActivate,
    onDragLeave: onDragDeactivate
  }
}
