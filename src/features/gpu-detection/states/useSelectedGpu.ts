'use client'

import { useHardwareQuery } from '@/cores/api-queries'
import { GPU_DETECTION_FORM_DEFAULTS } from '@/features/gpu-detection/constants/form-defaults'
import { hardwareStepService } from '@/features/gpu-detection/services/hardware-step'
import { GpuDetectionFormProps } from '@/features/gpu-detection/types/gpu-detection'
import { useWatch } from 'react-hook-form'

/** The detected hardware and the GPU picked in the Hardware step's form. */
export const useSelectedGpu = () => {
  const { data: hardware } = useHardwareQuery()
  const gpuIndex = useWatch<GpuDetectionFormProps, 'gpu'>({
    name: 'gpu',
    defaultValue: GPU_DETECTION_FORM_DEFAULTS.gpu
  })

  return {
    hardware,
    gpu: hardwareStepService.toSelectedGpu(gpuIndex, hardware),
    hasManyGpus: (hardware?.gpus.length ?? 0) > 1
  }
}
