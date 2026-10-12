import { MaxMemoryFormProps } from '@/features/max-memory-scale-factor/types'

/** The Hardware step's one form: the GPU's device index and the memory limits. */
export interface GpuDetectionFormProps extends MaxMemoryFormProps {
  gpu: number
}

export interface GpuSpec {
  label: string
  value: string
}
