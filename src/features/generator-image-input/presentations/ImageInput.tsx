'use client'

import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { useImageInputState } from '@/features/generator-image-input/states/useImageInputState'
import { GeneratorPreviewTile } from '@/features/generator-previewers/presentations/GeneratorPreviewTile'
import clsx from 'clsx'
import { useState } from 'react'
import { ImageInputTopRight } from './ImageInputTopRight'
import { ImageInputZone } from './ImageInputZone'

export const ImageInput = () => {
  const aspectRatio = useGeneratorAspectRatio()
  const [isDragActive, setIsDragActive] = useState(false)
  const { initImageBase64, hasImage, isLoading, onFile, onRemove } =
    useImageInputState()

  const topRight = hasImage && (
    <ImageInputTopRight isLoading={isLoading} onRemove={onRemove} />
  )

  return (
    <GeneratorPreviewTile
      aspectRatio={aspectRatio}
      className={clsx({
        'ring-2 ring-accent': isDragActive
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
