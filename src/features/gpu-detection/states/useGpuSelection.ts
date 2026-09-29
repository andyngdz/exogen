import { GpuDetectionFormProps } from '@/features/gpu-detection/types/gpu-detection'
import { GpuInfo } from '@/types'
import { findIndex } from 'es-toolkit/compat'
import { useController, useFormContext } from 'react-hook-form'

export const useGpuSelection = (gpus: GpuInfo[]) => {
  const { control } = useFormContext<GpuDetectionFormProps>()
  const primaryGpuIndex = findIndex(gpus, (gpu) => gpu.is_primary)
  const { field } = useController({
    control,
    name: 'gpu',
    defaultValue: primaryGpuIndex,
    // findIndex returns -1 when no GPU is primary, which must not count as a selection.
    rules: { validate: (gpuIndex) => gpuIndex >= 0 }
  })

  const onSelectedValueChange = (value: string) => {
    field.onChange(Number(value))
  }

  return { selectedValue: `${field.value}`, onSelectedValueChange }
}
