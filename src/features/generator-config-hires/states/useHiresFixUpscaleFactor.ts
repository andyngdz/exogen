import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'
import { ValueChanged } from '@/types'
import type { Key } from 'react-aria-components'
import { useController } from 'react-hook-form'

export const useHiresFixUpscaleFactor = () => {
  const { control } = useGeneratorConfigForm()
  const { field } = useController({
    control,
    name: 'hires_fix.upscale_factor'
  })

  const onUpscaleFactorChange: ValueChanged<Key | null> = (key) => {
    if (!key) return

    field.onChange(Number(key))
  }

  return { upscaleFactor: field.value, onUpscaleFactorChange }
}
