import { useImageViewMode } from '@/features/generator-previewers/states/useImageViewMode'
import { ImageViewMode } from '@/features/generator-previewers/states/useImageViewModeStore'
import { useGeneratorModeStore } from '@/features/generators/states'
import { GeneratorMode } from '@/types'

export const useStageResults = () => {
  const { viewMode } = useImageViewMode()
  const mode = useGeneratorModeStore((state) => state.mode)

  return {
    isSingleView: viewMode === ImageViewMode.SLIDER,
    isImageMode: mode === GeneratorMode.IMAGE_2_IMAGE
  }
}
