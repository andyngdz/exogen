'use client'

import { useHardwareQuery } from '@/cores/api-queries'
import { hardwareStepService } from '@/features/gpu-detection/services/hardware-step'
import { GPU_DETECTION_FORM_DEFAULTS } from '@/features/gpu-detection/constants/form-defaults'
import { GpuDetectionFormProps } from '@/features/gpu-detection/types/gpu-detection'
import { useForm, useWatch } from 'react-hook-form'

/** The Hardware step's form and which hardware card it shows. */
export const useGpuDetection = () => {
  const { data: hardware } = useHardwareQuery()
  const form = useForm<GpuDetectionFormProps>({
    values: {
      ...GPU_DETECTION_FORM_DEFAULTS,
      gpu: hardwareStepService.toPrimaryIndex(hardware)
    }
  })
  const gpuIndex = useWatch({
    control: form.control,
    name: 'gpu',
    defaultValue: GPU_DETECTION_FORM_DEFAULTS.gpu
  })
  const selectedGpu = hardwareStepService.toSelectedGpu(gpuIndex, hardware)

  return {
    form,
    isDetecting: !hardware,
    hasGpuCard: Boolean(selectedGpu && hardware?.is_cuda),
    isCpuOnly: Boolean(hardware && !hardware.is_cuda)
  }
}
