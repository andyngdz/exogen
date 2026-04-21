'use client'

import { Button } from '@heroui/react'
import { useEffect, useRef } from 'react'

import { useImageDropzone } from '../states/useImageDropzone'
import { useImageFilePicker } from '../states/useImageFilePicker'
import { useImagePaste } from '../states/useImagePaste'
import { ImageInputBody } from './ImageInputBody'

interface ImageInputZoneProps {
  hasImage: boolean
  initImageBase64?: string
  isLoading: boolean
  onFile: (file: File) => Promise<void>
  onDragActiveChange: (isDragActive: boolean) => void
}

export const ImageInputZone = ({
  hasImage,
  initImageBase64,
  isLoading,
  onFile,
  onDragActiveChange
}: ImageInputZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { onFileChange } = useImageFilePicker({ onFile })
  const { isDragActive, onDrop, onDragEnter, onDragOver, onDragLeave } =
    useImageDropzone({ onFile })

  useEffect(() => {
    onDragActiveChange(isDragActive)
  }, [isDragActive, onDragActiveChange])

  useImagePaste({ onFile })

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <Button
        type="button"
        aria-label={hasImage ? 'Change input image' : 'Upload input image'}
        className="h-full w-full min-h-0 p-0"
        variant="light"
        isDisabled={isLoading}
        onPress={() => {
          fileInputRef.current?.click()
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <ImageInputBody hasImage={hasImage} initImageBase64={initImageBase64} />
      </Button>
    </>
  )
}
