import { GpuDetectionFormProps } from '@/features/gpu-detection/types/gpu-detection'
import { MAX_MEMORY_FORM_DEFAULTS } from '@/features/max-memory-scale-factor/constants'

export const GPU_DETECTION_FORM_DEFAULTS: GpuDetectionFormProps = {
  gpu: 0,
  ...MAX_MEMORY_FORM_DEFAULTS
}
