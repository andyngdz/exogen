import { useBackendUrl } from '@/cores/backend-initialization'
import { useGeneratorPhotoviewStore } from '@/features/generator-photoview'
import { useDownloadImages } from '@/features/generator-previewers/states'
import {
  useGenerationStatusStore,
  useImageAsInput,
  useUseImageGenerationStore
} from '@/features/generators/states'
import { isEmpty } from 'es-toolkit/compat'

/** Use as input, download and open viewer for the image shown in the hero. */
export const useStageHeroActions = (index: number) => {
  const baseURL = useBackendUrl()
  const items = useUseImageGenerationStore((state) => state.items)
  const isGenerating = useGenerationStatusStore((state) => state.isGenerating)
  const openPhotoview = useGeneratorPhotoviewStore(
    (state) => state.openPhotoview
  )
  const { onDownloadImage } = useDownloadImages()
  const { isUsingAsInput, loadAsInput } = useImageAsInput()

  const imagePath = items[index].path
  const imageUrl = `${baseURL}/${imagePath}`

  return {
    baseURL,
    imagePath,
    isGenerating,
    isReady: !isGenerating && !isEmpty(imagePath),
    isUsingAsInput,
    onUseAsInput: () => void loadAsInput(imageUrl),
    onDownload: () => void onDownloadImage(imageUrl),
    onOpenViewer: () => openPhotoview(index)
  }
}
