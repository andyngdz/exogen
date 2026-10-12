'use client'

import { GPU_DETECTION_FORM_DEFAULTS } from '@/features/gpu-detection/constants/form-defaults'
import { GpuDetectionFormProps } from '@/features/gpu-detection/types/gpu-detection'
import { useFormContext, useWatch } from 'react-hook-form'

/** The memory limits in the Hardware step's form, with their setters. */
export const useGpuDetectionMemory = () => {
  const { control, setValue } = useFormContext<GpuDetectionFormProps>()
  const gpuScaleFactor = useWatch({
    control,
    name: 'gpuScaleFactor',
    defaultValue: GPU_DETECTION_FORM_DEFAULTS.gpuScaleFactor
  })
  const ramScaleFactor = useWatch({
    control,
    name: 'ramScaleFactor',
    defaultValue: GPU_DETECTION_FORM_DEFAULTS.ramScaleFactor
  })

  return {
    gpuScaleFactor,
    ramScaleFactor,
    onGpuChange: (scaleFactor: number) =>
      setValue('gpuScaleFactor', scaleFactor),
    onRamChange: (scaleFactor: number) =>
      setValue('ramScaleFactor', scaleFactor)
  }
}
