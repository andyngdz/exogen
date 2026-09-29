import { imageInputService } from '@/features/generator-image-input/services'
import { ValueChanged } from '@/types'
import { useCallback } from 'react'

interface UseImageFilePickerParams {
  onFile: ValueChanged<File, Promise<void>>
}

export const useImageFilePicker = ({ onFile }: UseImageFilePickerParams) => {
  // FileTrigger clears its hidden input on each press, so the same file can be picked again.
  const onFilesSelect: ValueChanged<
    FileList | null,
    Promise<void>
  > = useCallback(
    async (files) => {
      if (!files) return

      const file = imageInputService.firstFile(files)
      if (!file) return

      await onFile(file)
    },
    [onFile]
  )

  return {
    onFilesSelect
  }
}
