import { useBackendUrl } from '@/cores/backend-initialization'
import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { useGeneratorPhotoviewStore } from '@/features/generator-photoview'
import { useGenerationStatusStore } from '@/features/generators/states'
import { useUseImageGenerationStore } from '@/features/generators'
import { ImageGenerationStepEndResponse } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import { useCallback, useMemo } from 'react'

import { useDownloadImages } from './useDownloadImages'

export const useGeneratorPreviewerItemModel = (
  imageStepEnd: ImageGenerationStepEndResponse
) => {
  const baseURL = useBackendUrl()
  const aspectRatio = useGeneratorAspectRatio()
  const { isGenerating } = useGenerationStatusStore()

  const { items } = useUseImageGenerationStore()
  const { onDownloadImage } = useDownloadImages()
  const { openPhotoview } = useGeneratorPhotoviewStore()

  const item = items[imageStepEnd.index]

  const canDownload = useMemo(() => !isEmpty(item.path), [item.path])
  const canOpenPhotoview = useMemo(
    () => !isGenerating && !isEmpty(item.path),
    [isGenerating, item.path]
  )

  const onOpenPhotoview = useCallback(() => {
    openPhotoview(imageStepEnd.index)
  }, [imageStepEnd.index, openPhotoview])

  const onHandleDownloadImage = useCallback(() => {
    onDownloadImage(`${baseURL}/${item.path}`)
  }, [baseURL, item.path, onDownloadImage])

  return {
    aspectRatio,
    baseURL,
    imageIndex: imageStepEnd.index,
    imagePath: item.path,
    imageBase64: imageStepEnd.image_base64,
    canDownload,
    canOpenPhotoview,
    onOpenPhotoview,
    onHandleDownloadImage,
    ariaLabel: `Open image ${imageStepEnd.index + 1} in photoview`
  }
}
