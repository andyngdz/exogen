import { useSamplersQuery } from '@/cores/api-queries'
import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'
import { ValueChanged } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import type { Key } from 'react-aria-components'
import { useController } from 'react-hook-form'

export const useGeneratorConfigSamplerDropdown = () => {
  const { control } = useGeneratorConfigForm()
  const { field } = useController({ control, name: 'sampler' })
  const { data: samplers, isLoading, isError } = useSamplersQuery()

  const onSamplerChange: ValueChanged<Key | null> = (key) => {
    if (!key) return

    field.onChange(key)
  }

  return {
    samplers,
    isLoading,
    isError,
    isEmptySamplers: !!samplers && isEmpty(samplers),
    sampler: field.value,
    onSamplerChange
  }
}
