'use client'

import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { useImageInputState } from '@/features/generator-image-input/states/useImageInputState'
import { ImageInputTopRight } from './ImageInputTopRight'
import { ImageInputZone } from './ImageInputZone'

export const ImageInput = () => {
  const aspectRatio = useGeneratorAspectRatio()
  const { initImageBase64, hasImage, isLoading, onFile, onRemove } =
    useImageInputState()

  return (
    <ImageInputZone
      aspectRatio={aspectRatio}
      hasImage={hasImage}
      initImageBase64={initImageBase64}
      isLoading={isLoading}
      onFile={onFile}
    >
      {hasImage && (
        <ImageInputTopRight isLoading={isLoading} onRemove={onRemove} />
      )}
    </ImageInputZone>
  )
}
