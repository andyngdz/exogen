import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'
import { ValueChanged } from '@/types'
import type { Key } from 'react-aria-components'
import { useController } from 'react-hook-form'
import { useGeneratorConfigHiresFixUpscaler } from './useGeneratorConfigHiresFixUpscaler'

export const useHiresFixUpscalerSelect = () => {
  const { control } = useGeneratorConfigForm()
  const { field } = useController({ control, name: 'hires_fix.upscaler' })
  const { upscalers, onUpscalerChange } = useGeneratorConfigHiresFixUpscaler()

  const onUpscalerSelect: ValueChanged<Key | null> = (key) => {
    if (!key) return

    const upscalerValue = `${key}`
    field.onChange(upscalerValue)
    onUpscalerChange(upscalerValue)
  }

  return { upscalers, upscaler: field.value, onUpscalerSelect }
}
