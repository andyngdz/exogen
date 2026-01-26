import type { ChangeEvent } from 'react'
import { useCallback } from 'react'

import { imageInputService } from '../services'

interface UseImageFilePickerParams {
  onFile: (file: File) => void
}

export const useImageFilePicker = ({ onFile }: UseImageFilePickerParams) => {
  const onFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      const file = imageInputService.firstFile(files)
      if (!file) return

      onFile(file)

      // Allow re-uploading the same file consecutively.
      event.target.value = ''
    },
    [onFile]
  )

  return {
    onFileChange
  }
}
