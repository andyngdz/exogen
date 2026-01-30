'use client'

import clsx from 'clsx'
import { useRef } from 'react'
import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { useImage2ImageConfigStore } from '@/features/generators'
import { GeneratorPreviewTile } from '@/features/generator-previewers/presentations/GeneratorPreviewTile'
import { useImageInput } from '../states'
import { ImageInputBottomOverlay } from './ImageInputBottomOverlay'
import { ImageInputBody } from './ImageInputBody'
import { ImageInputTopRight } from './ImageInputTopRight'

export const ImageInput = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const aspectRatio = useGeneratorAspectRatio()

  const { initImageBase64, setInitImageBase64, clearInitImageBase64 } =
    useImage2ImageConfigStore()

  const hasImage = !!initImageBase64

  const {
    isDragActive,
    isLoading,
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

  const onRemove = () => {
    clearInitImageBase64()
    clearLastError()
  }

  const topRight = hasImage && (
    <ImageInputTopRight isLoading={isLoading} onRemove={onRemove} />
  )

  const bottomOverlay = lastError && (
    <ImageInputBottomOverlay message={lastError} />
  )

  return (
    <GeneratorPreviewTile
      aspectRatio={aspectRatio}
      className={clsx({
        'ring-2 ring-primary-300': isDragActive
      })}
      topRight={topRight}
      topRightClassName="top-3 right-3"
      bottomOverlay={bottomOverlay}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <div
        className="h-full w-full"
        onClick={() => {
          if (isLoading) return
          clearLastError()
          fileInputRef.current?.click()
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <ImageInputBody hasImage={hasImage} initImageBase64={initImageBase64} />
      </div>
    </GeneratorPreviewTile>
  )
}
