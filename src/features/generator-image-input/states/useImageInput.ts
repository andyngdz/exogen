import type { ChangeEvent, DragEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

interface UseImageInputParams {
  onImageDataUrl: (dataUrl: string) => void
}

const fileToDataUrl = async (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read file'))
        return
      }

      resolve(reader.result)
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const firstImageFile = (files: FileList | null) => {
  if (!files?.length) return

  const file = files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return

  return file
}

const clipboardImageFile = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items?.length) return

  const imageItem = Array.from(items).find((item) =>
    item.type.startsWith('image/')
  )
  return imageItem?.getAsFile()
}

export const useImageInput = ({ onImageDataUrl }: UseImageInputParams) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadFile = useCallback(
    async (file: File) => {
      setIsLoading(true)
      try {
        const dataUrl = await fileToDataUrl(file)
        onImageDataUrl(dataUrl)
      } finally {
        setIsLoading(false)
      }
    },
    [onImageDataUrl]
  )

  const onFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = firstImageFile(event.target.files)
      if (!file) return

      void loadFile(file)

      // Allow re-uploading the same file consecutively.
      event.target.value = ''
    },
    [loadFile]
  )

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragActive(false)

      const file = firstImageFile(event.dataTransfer.files)
      if (!file) return

      void loadFile(file)
    },
    [loadFile]
  )

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragActive(true)
  }, [])

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragActive(true)
  }, [])

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragActive(false)
  }, [])

  const onPaste = useCallback(
    (event: ClipboardEvent) => {
      const file = clipboardImageFile(event)
      if (!file) return

      void loadFile(file)
    },
    [loadFile]
  )

  useEffect(() => {
    document.addEventListener('paste', onPaste)

    return () => {
      document.removeEventListener('paste', onPaste)
    }
  }, [onPaste])

  return {
    isDragActive,
    isLoading,
    onFileChange,
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave
  }
}
