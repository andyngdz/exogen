import { useSamplersQuery } from '@/cores/api-queries'
import { useStyleSections } from '@/cores/hooks/useStyleSections'
import { useLoraSelection } from '@/features/extra-loras/states'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { dockPillService } from '@/features/generator-dock/services/dock-pills'
import { imageSizeService } from '@/features/generator-inspector/services/image-size-service'
import { useImageSizeStore } from '@/features/generator-inspector/states/useImageSizeStore'
import { ImageSizePreset } from '@/features/generator-inspector/types'
import {
  useGeneratorModeStore,
  useHiresFixEnabledStore,
  useImage2ImageConfigStore
} from '@/features/generators/states'
import { GeneratorMode } from '@/types'
import { filter, find, includes, map } from 'es-toolkit/compat'
import { useFormContext, useWatch } from 'react-hook-form'

/** Reads the form and the inspector stores into the dock's summary pills. */
export const useDockPills = () => {
  const { control, getValues } = useFormContext<GeneratorConfigFormValues>()
  // Subscribes to every field; getValues below reads the typed snapshot.
  useWatch({ control, defaultValue: getValues() })
  const family = useImageSizeStore((state) => state.family)
  const isCustomChosen = useImageSizeStore((state) => state.isCustomChosen)
  const isHiresFixEnabled = useHiresFixEnabledStore(
    (state) => state.isHiresFixEnabled
  )
  const mode = useGeneratorModeStore((state) => state.mode)
  const strength = useImage2ImageConfigStore((state) => state.strength)
  const { data: samplers } = useSamplersQuery()
  const { styleItems } = useStyleSections()
  const { selectedLoras } = useLoraSelection()

  const formValues = getValues()
  const sizePreset = isCustomChosen
    ? ImageSizePreset.CUSTOM
    : imageSizeService.findPreset(family, formValues)
  const sampler = find(samplers, { value: formValues.sampler })
  const selectedStyles = filter(styleItems, (style) =>
    includes(formValues.styles, style.id)
  )

  const pills = dockPillService.toPills({
    values: formValues,
    sizePreset,
    samplerName: sampler?.name ?? formValues.sampler,
    isHiresFixEnabled,
    isImageMode: mode === GeneratorMode.IMAGE_2_IMAGE,
    denoisingStrength: strength,
    loras: map(selectedLoras, (lora) => ({
      name: lora.name,
      weight: find(formValues.loras, { lora_id: lora.id })?.weight ?? 1
    })),
    styleNames: map(selectedStyles, 'name')
  })

  return { pills }
}
