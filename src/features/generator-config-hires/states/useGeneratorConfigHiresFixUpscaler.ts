'use client'

import { useConfig } from '@/cores/hooks'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { useFormContext } from 'react-hook-form'

export const useGeneratorConfigHiresFixUpscaler = () => {
  const { setValue } = useFormContext<GeneratorConfigFormValues>()
  const { upscalers, upscalerOptions } = useConfig()

  const onUpscalerChange = (upscalerValue: string) => {
    const selectedOption = upscalerOptions.find(
      (o) => o.value === upscalerValue
    )

    if (selectedOption) {
      setValue(
        'hires_fix.denoising_strength',
        selectedOption.suggested_denoise_strength
      )
    }
  }

  return { upscalers, onUpscalerChange }
}
