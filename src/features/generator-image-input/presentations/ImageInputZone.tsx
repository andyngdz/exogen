'use client'

import { useImageDropzone } from '@/features/generator-image-input/states/useImageDropzone'
import { useImageFilePicker } from '@/features/generator-image-input/states/useImageFilePicker'
import { useImagePaste } from '@/features/generator-image-input/states/useImagePaste'
import { ValueChanged } from '@/types'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { DropZone, FileTrigger } from 'react-aria-components'
import { ImageInputBody } from './ImageInputBody'

interface ImageInputZoneProps {
  aspectRatio?: number
  hasImage: boolean
  initImageBase64?: string
  isLoading: boolean
  onFile: ValueChanged<File, Promise<void>>
  children?: ReactNode
}

/** The input tile itself: one surface that takes a click, a drop or a paste. */
export const ImageInputZone = ({
  aspectRatio,
  hasImage,
  initImageBase64,
  isLoading,
  onFile,
  children
}: ImageInputZoneProps) => {
  const { onFilesSelect } = useImageFilePicker({ onFile })
  const { isDragActive, onDropEnter, onDropExit, onDrop } = useImageDropzone({
    onFile
  })

  useImagePaste({ onFile })

  return (
    <DropZone
      aria-label="Drop an input image"
      className={clsx(
        'relative h-full w-full',
        'overflow-hidden rounded-2xl bg-surface',
        { 'ring-2 ring-accent': isDragActive }
      )}
      style={{ aspectRatio }}
      onDropEnter={onDropEnter}
      onDropExit={onDropExit}
      onDrop={onDrop}
    >
      <FileTrigger
        acceptedFileTypes={['image/*']}
        onSelect={(files) => void onFilesSelect(files)}
      >
        <Button
          aria-label={hasImage ? 'Change input image' : 'Upload input image'}
          className="h-full w-full min-h-0 rounded-none p-0"
          variant="ghost"
          isDisabled={isLoading}
        >
          <ImageInputBody
            hasImage={hasImage}
            initImageBase64={initImageBase64}
          />
        </Button>
      </FileTrigger>
      {children && (
        <div className="absolute top-3 right-3 z-10">{children}</div>
      )}
    </DropZone>
  )
}
