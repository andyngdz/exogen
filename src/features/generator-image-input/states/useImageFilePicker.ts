import { useCallback } from 'react'

import { imageInputService } from '../services'

export type ImageFilePickerChangeEvent = {
  target: HTMLInputElement
}

interface UseImageFilePickerParams {
  onFile: (file: File) => Promise<void>
}

export const useImageFilePicker = ({ onFile }: UseImageFilePickerParams) => {
  const onFileChange = useCallback(
    async (event: ImageFilePickerChangeEvent) => {
      const input = event.target
      const files = input.files
      if (!files) return

      const file = imageInputService.firstFile(files)
      if (!file) return

      try {
        await onFile(file)
      } finally {
        // Allow re-uploading the same file consecutively.
        input.value = ''
      }
    },
    [onFile]
  )

  return {
    onFileChange
  }
}
