'use client'

import { useImageDropzone } from '@/features/generator-image-input/states/useImageDropzone'
import { useImageFilePicker } from '@/features/generator-image-input/states/useImageFilePicker'
import { useImagePaste } from '@/features/generator-image-input/states/useImagePaste'
import { ValueChanged } from '@/types'
import { Button } from '@heroui/react'
import { useEffect } from 'react'
import { FileTrigger } from 'react-aria-components'
import { ImageInputBody } from './ImageInputBody'

interface ImageInputZoneProps {
  hasImage: boolean
  initImageBase64?: string
  isLoading: boolean
  onFile: ValueChanged<File, Promise<void>>
  onDragActiveChange: ValueChanged<boolean>
}

export const ImageInputZone = ({
  hasImage,
  initImageBase64,
  isLoading,
  onFile,
  onDragActiveChange
}: ImageInputZoneProps) => {
  const { onFilesSelect } = useImageFilePicker({ onFile })
  const { isDragActive, onDrop, onDragEnter, onDragOver, onDragLeave } =
    useImageDropzone({ onFile })

  useEffect(() => {
    onDragActiveChange(isDragActive)
  }, [isDragActive, onDragActiveChange])

  useImagePaste({ onFile })

  return (
    <div
      className="h-full w-full"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <FileTrigger acceptedFileTypes={['image/*']} onSelect={onFilesSelect}>
        <Button
          aria-label={hasImage ? 'Change input image' : 'Upload input image'}
          className="h-full w-full min-h-0 p-0"
          variant="ghost"
          isDisabled={isLoading}
        >
          <ImageInputBody
            hasImage={hasImage}
            initImageBase64={initImageBase64}
          />
        </Button>
      </FileTrigger>
    </div>
  )
}
