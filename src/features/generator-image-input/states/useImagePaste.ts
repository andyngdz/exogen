import { useCallback, useEffect } from 'react'

import { imageInputService } from '../services'

interface UseImagePasteParams {
  onFile: (file: File) => Promise<void>
}

export const useImagePaste = ({ onFile }: UseImagePasteParams) => {
  const onPaste = useCallback(
    async (event: ClipboardEvent) => {
      const file = imageInputService.clipboardImageFile(event)
      if (!file) return

      await onFile(file)
    },
    [onFile]
  )

  useEffect(() => {
    document.addEventListener('paste', onPaste)

    return () => {
      document.removeEventListener('paste', onPaste)
    }
  }, [onPaste])
}
