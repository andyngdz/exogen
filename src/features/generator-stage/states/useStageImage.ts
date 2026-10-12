import { useBackendUrl } from '@/cores/backend-initialization'
import { useUseImageGenerationStore } from '@/features/generators/states'
import { ImageGenerationStepEndResponse } from '@/types'

/** Renderer props for one image of the current run: saved file or step preview. */
export const useStageImage = (imageStepEnd: ImageGenerationStepEndResponse) => {
  const baseURL = useBackendUrl()
  const items = useUseImageGenerationStore((state) => state.items)

  return {
    baseURL,
    imagePath: items[imageStepEnd.index].path,
    imageBase64: imageStepEnd.image_base64,
    imageIndex: imageStepEnd.index
  }
}
