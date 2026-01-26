import { useCallback, useEffect } from 'react'

import { imageInputService } from '../services'

interface UseImagePasteParams {
  onFile: (file: File) => void
}

export const useImagePaste = ({ onFile }: UseImagePasteParams) => {
  const onPaste = useCallback(
    (event: ClipboardEvent) => {
      const file = imageInputService.clipboardImageFile(event)
      if (!file) return

      onFile(file)
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
