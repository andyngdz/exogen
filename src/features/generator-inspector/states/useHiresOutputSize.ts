import { GeneratorConfigFormValues } from '@/features/generator-configs'
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
    baseLabel: `${width} × ${height}`,
    ...(upscaleFactor && {
      outputLabel: `${Math.round(width * upscaleFactor)} × ${Math.round(height * upscaleFactor)}`
    })
  }
}
