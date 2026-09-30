import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { imageSizeService } from '@/features/generator-inspector/services/image-size-service'
import { ImageSizePreset } from '@/features/generator-inspector/types'
import { ValueChanged } from '@/types'
import { first } from 'es-toolkit/compat'
import { useFormContext, useWatch } from 'react-hook-form'
import type { Selection } from 'react-aria-components'
import { IMAGE_SIZE_ACTIONS, useImageSizeStore } from './useImageSizeStore'

/** Size preset selection for the Basic tab, derived from the form's width and height. */
export const useImageSizePreset = () => {
  const { control, getValues, setValue } =
    useFormContext<GeneratorConfigFormValues>()
  // useWatch returns defaultValue until the field first changes, so seed it
  // from the form's current value rather than the shared defaults.
  const width = useWatch({
    control,
    name: 'width',
    defaultValue: getValues('width')
  })
  const height = useWatch({
    control,
    name: 'height',
    defaultValue: getValues('height')
  })
  const family = useImageSizeStore((state) => state.family)
  const isCustomChosen = useImageSizeStore((state) => state.isCustomChosen)

  const selectedPreset = isCustomChosen
    ? ImageSizePreset.CUSTOM
    : imageSizeService.findPreset(family, { width, height })

  const onPresetChange: ValueChanged<Selection> = (keys) => {
    if (keys === 'all') return

    const preset = imageSizeService.parsePreset(first(Array.from(keys)))
    if (!preset) return

    if (preset === ImageSizePreset.CUSTOM) {
      IMAGE_SIZE_ACTIONS.setCustomChosen(true)
      return
    }

    IMAGE_SIZE_ACTIONS.setCustomChosen(false)
    const size = imageSizeService.getPresetSize(family, preset)
    setValue('width', size.width, { shouldDirty: true })
    setValue('height', size.height, { shouldDirty: true })
  }

  const onSwap = () => {
    const currentWidth = getValues('width')
    setValue('width', getValues('height'), { shouldDirty: true })
    setValue('height', currentWidth, { shouldDirty: true })
  }

  return {
    presets: [...imageSizeService.presets, ImageSizePreset.CUSTOM],
    selectedPreset,
    isCustom: selectedPreset === ImageSizePreset.CUSTOM,
    width,
    height,
    onPresetChange,
    onSwap
  }
}
