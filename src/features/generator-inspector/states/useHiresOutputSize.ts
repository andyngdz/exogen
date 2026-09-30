import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { imageSizeService } from '@/features/generator-inspector/services/image-size-service'
import { useFormContext, useWatch } from 'react-hook-form'

/** Size before and after the hires upscale, for the Hires tab's output line. */
export const useHiresOutputSize = () => {
  const { control, getValues } = useFormContext<GeneratorConfigFormValues>()
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
  const upscaleFactor = useWatch({
    control,
    name: 'hires_fix.upscale_factor',
    defaultValue: getValues('hires_fix.upscale_factor')
  })

  return {
    baseLabel: imageSizeService.toSizeLabel({ width, height }),
    ...(upscaleFactor && {
      outputLabel: imageSizeService.toSizeLabel({
        width: Math.round(width * upscaleFactor),
        height: Math.round(height * upscaleFactor)
      })
    })
  }
}
