'use client'

import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { GeneratorPreviewTile } from '@/features/generator-previewers/presentations/GeneratorPreviewTile'
import { useImage2ImageConfigStore } from '@/features/generators'
import clsx from 'clsx'
import { useState } from 'react'
import { useImageInputController } from '../states'
import { ImageInputTopRight } from './ImageInputTopRight'
import { ImageInputZone } from './ImageInputZone'

export const ImageInput = () => {
  const aspectRatio = useGeneratorAspectRatio()
  const [isDragActive, setIsDragActive] = useState(false)

  const { initImageBase64, setInitImageBase64, clearInitImageBase64 } =
    useImage2ImageConfigStore()

  const hasImage = !!initImageBase64

  const { isLoading, onFile } = useImageInputController({
    onImageDataUrl: setInitImageBase64
  })

  const onRemove = () => {
    clearInitImageBase64()
  }

  const topRight = hasImage && (
    <ImageInputTopRight isLoading={isLoading} onRemove={onRemove} />
  )

  return (
    <GeneratorPreviewTile
      aspectRatio={aspectRatio}
      className={clsx({
        'ring-2 ring-primary-300': isDragActive
      })}
      topRight={topRight}
      topRightClassName="top-3 right-3"
    >
      <ImageInputZone
        hasImage={hasImage}
        initImageBase64={initImageBase64}
        isLoading={isLoading}
        onFile={onFile}
        onDragActiveChange={setIsDragActive}
      />
    </GeneratorPreviewTile>
  )
}
