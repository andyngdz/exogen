'use client'

import { useBackendUrl } from '@/cores/backend-initialization'
import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { useGeneratorPhotoviewStore } from '@/features/generator-photoview'
import { ImageGenerationStepEndResponse } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import { FC, useCallback, useMemo } from 'react'
import { useDownloadImages, useGeneratorPreviewer } from '../states'
import { GeneratorImageDownloadButton } from './GeneratorImageDownloadButton'
import { GeneratorImageRenderer } from './GeneratorImageRenderer'
import { GeneratorPreviewTile } from './GeneratorPreviewTile'

export interface GeneratorPreviewerItemProps {
  imageStepEnd: ImageGenerationStepEndResponse
}

export const GeneratorPreviewerItem: FC<GeneratorPreviewerItemProps> = ({
  imageStepEnd
}) => {
  const baseURL = useBackendUrl()
  const { onDownloadImage } = useDownloadImages()
  const { items } = useGeneratorPreviewer()
  const { openPhotoview } = useGeneratorPhotoviewStore()
  const aspectRatio = useGeneratorAspectRatio()
  const item = items[imageStepEnd.index]

  const onHandleDownloadImage = useCallback(() => {
    const url = `${baseURL}/${item.path}`
    onDownloadImage(url)
  }, [baseURL, item.path, onDownloadImage])

  const hasImage = useMemo(
    () => !isEmpty(item.path) || !isEmpty(imageStepEnd.image_base64),
    [item.path, imageStepEnd.image_base64]
  )

  const onOpenPhotoview = useCallback(() => {
    if (!hasImage) return
    openPhotoview(imageStepEnd.index)
  }, [hasImage, imageStepEnd.index, openPhotoview])

  return (
    <GeneratorPreviewTile
      aspectRatio={aspectRatio}
      onPress={onOpenPhotoview}
      ariaLabel={`Open image ${imageStepEnd.index + 1} in photoview`}
      topRight={
        hasImage && (
          <GeneratorImageDownloadButton onDownload={onHandleDownloadImage} />
        )
      }
    >
      <GeneratorImageRenderer
        imagePath={item.path}
        imageBase64={imageStepEnd.image_base64}
        imageIndex={imageStepEnd.index}
        baseURL={baseURL}
      />
    </GeneratorPreviewTile>
  )
}
