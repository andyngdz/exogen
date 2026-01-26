import type { DragEvent } from 'react'
import { useCallback, useState } from 'react'

import { imageInputService } from '../services'

interface UseImageDropzoneParams {
  onFile: (file: File) => void
}

export const useImageDropzone = ({ onFile }: UseImageDropzoneParams) => {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDragActivate = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragActive(true)
  }, [])

  const onDragDeactivate = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragActive(false)
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragActive(false)

      const file = imageInputService.firstFile(event.dataTransfer.files)
      if (!file) return

      onFile(file)
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
