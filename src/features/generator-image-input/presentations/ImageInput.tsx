'use client'

import { useImage2ImageConfigStore } from '@/features/generators'
import { Card } from '@heroui/react'
import clsx from 'clsx'
import { useRef } from 'react'
import { useImageInput } from '../states'
import { ImageInputBody } from './ImageInputBody'
import { ImageInputHeader } from './ImageInputHeader'

export const ImageInput = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { initImageBase64, setInitImageBase64, clearInitImageBase64 } =
    useImage2ImageConfigStore()

  const hasImage = !!initImageBase64

  const {
    isDragActive,
    isLoading,
    dropzoneLabel,
    lastError,
    clearLastError,
    onFileChange,
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave
  } = useImageInput({
    hasImage,
    onImageDataUrl: setInitImageBase64
  })

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <Card
        as="div"
        shadow="none"
        isPressable
        className={clsx('relative w-full overflow-hidden bg-content2', {
          'bg-primary-50': isDragActive
        })}
        onPress={() => {
          if (isLoading) return
          clearLastError()
          fileInputRef.current?.click()
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <ImageInputHeader
          dropzoneLabel={dropzoneLabel}
          isLoading={isLoading}
          hasImage={hasImage}
          onRemove={() => {
            clearInitImageBase64()
            clearLastError()
          }}
        />
        <ImageInputBody
          hasImage={hasImage}
          initImageBase64={initImageBase64}
          lastError={lastError}
        />
      </Card>
    </div>
  )
}
