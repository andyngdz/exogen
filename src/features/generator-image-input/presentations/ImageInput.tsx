'use client'

import { useImage2ImageConfigStore } from '@/features/generators'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const readFileAsDataUrl = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
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

const pickFirstImageFile = (files: FileList | null): File | undefined => {
  if (!files?.length) return

  const file = files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return

  return file
}

export const ImageInput = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const { initImageBase64, setInitImageBase64, clearInitImageBase64 } =
    useImage2ImageConfigStore()

  const hasImage = !!initImageBase64

  const onPickFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback(async () => {
    const file = pickFirstImageFile(fileInputRef.current?.files || null)
    if (!file) return

    const dataUrl = await readFileAsDataUrl(file)
    setInitImageBase64(dataUrl)
  }, [setInitImageBase64])

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragActive(false)

      const file = pickFirstImageFile(event.dataTransfer.files)
      if (!file) return

      const dataUrl = await readFileAsDataUrl(file)
      setInitImageBase64(dataUrl)
    },
    [setInitImageBase64]
  )

  const onPaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items?.length) return

      const imageItem = Array.from(items).find((item) =>
        item.type.startsWith('image/')
      )
      const file = imageItem?.getAsFile()
      if (!file) return

      const dataUrl = await readFileAsDataUrl(file)
      setInitImageBase64(dataUrl)
    },
    [setInitImageBase64]
  )

  useEffect(() => {
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [onPaste])

  const dropzoneLabel = useMemo(() => {
    if (hasImage) return 'Input image'
    return 'Drop an image here, paste, or upload'
  }, [hasImage])

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <div
        className={clsx(
          'relative w-full overflow-hidden rounded-large border border-default-200 bg-default-50',
          {
            'border-primary bg-primary-50': isDragActive
          }
        )}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragActive(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragActive(false)
        }}
        onDrop={onDrop}
      >
        <div className="flex items-center justify-between gap-4 p-3">
          <span className="text-sm text-default-600">{dropzoneLabel}</span>
          <div className="flex items-center gap-2">
            {hasImage && (
              <Button size="sm" variant="flat" onPress={clearInitImageBase64}>
                Remove
              </Button>
            )}
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={onPickFile}
            >
              Upload
            </Button>
          </div>
        </div>

        {hasImage && (
          <div className="px-3 pb-3">
            <img
              src={initImageBase64}
              alt="Input"
              className="max-h-48 w-full rounded-medium object-contain bg-black/5"
            />
          </div>
        )}
      </div>
    </div>
  )
}
