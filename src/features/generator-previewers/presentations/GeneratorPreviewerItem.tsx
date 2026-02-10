'use client'

import { ImageGenerationStepEndResponse } from '@/types'
import { FC } from 'react'
import { useGeneratorPreviewerItemModel } from '@/features/generator-previewers/states'
import { GeneratorImageDownloadButton } from './GeneratorImageDownloadButton'
import { GeneratorImageRenderer } from './GeneratorImageRenderer'
import { GeneratorPreviewTile } from './GeneratorPreviewTile'

export interface GeneratorPreviewerItemProps {
  imageStepEnd: ImageGenerationStepEndResponse
}

export const GeneratorPreviewerItem: FC<GeneratorPreviewerItemProps> = ({
  imageStepEnd
}) => {
  const model = useGeneratorPreviewerItemModel(imageStepEnd)

  const topRight = model.canDownload && (
    <GeneratorImageDownloadButton onDownload={model.onHandleDownloadImage} />
  )

  return (
    <>
      {model.canOpenPhotoview ? (
        <GeneratorPreviewTile
          aspectRatio={model.aspectRatio}
          onPress={model.onOpenPhotoview}
          ariaLabel={model.ariaLabel}
          topRight={topRight}
        >
          <GeneratorImageRenderer
            imagePath={model.imagePath}
            imageBase64={model.imageBase64}
            imageIndex={model.imageIndex}
            baseURL={model.baseURL}
          />
        </GeneratorPreviewTile>
      ) : (
        <GeneratorPreviewTile
          aspectRatio={model.aspectRatio}
          ariaLabel={model.ariaLabel}
          topRight={topRight}
        >
          <GeneratorImageRenderer
            imagePath={model.imagePath}
            imageBase64={model.imageBase64}
            imageIndex={model.imageIndex}
            baseURL={model.baseURL}
          />
        </GeneratorPreviewTile>
      )}
    </>
  )
}
