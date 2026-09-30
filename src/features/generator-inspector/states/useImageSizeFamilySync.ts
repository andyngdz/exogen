import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { imageSizeService } from '@/features/generator-inspector/services/image-size-service'
import { ImageSizePreset } from '@/features/generator-inspector/types'
import { useModelSelectorStore } from '@/features/model-selectors/states'
import { ModelFamily } from '@/types'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { IMAGE_SIZE_ACTIONS, useImageSizeStore } from './useImageSizeStore'

/**
 * Moves a preset size to the new family's version of the same preset when the
 * loaded model changes family. Mount once where it stays mounted (the
 * inspector root). Every load passes through UNKNOWN, which is ignored, so a
 * reload of the same model never resizes.
 */
export const useImageSizeFamilySync = () => {
  const { getValues, setValue } = useFormContext<GeneratorConfigFormValues>()
  const loadedFamily = useModelSelectorStore(
    (state) => state.loaded_model_family
  )

  useEffect(() => {
    const { family, isCustomChosen } = useImageSizeStore.getState()
    if (loadedFamily === ModelFamily.UNKNOWN || loadedFamily === family) return

    const size = { width: getValues('width'), height: getValues('height') }
    const preset = isCustomChosen
      ? ImageSizePreset.CUSTOM
      : imageSizeService.findPreset(family, size)
    IMAGE_SIZE_ACTIONS.setFamily(loadedFamily)
    if (preset === ImageSizePreset.CUSTOM) return

    const nextSize = imageSizeService.getPresetSize(loadedFamily, preset)
    setValue('width', nextSize.width, { shouldDirty: true })
    setValue('height', nextSize.height, { shouldDirty: true })
  }, [getValues, loadedFamily, setValue])
}
