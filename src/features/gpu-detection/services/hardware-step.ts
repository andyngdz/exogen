import { GpuSpec } from '@/features/gpu-detection/types/gpu-detection'
import { formatter } from '@/services'
import { GpuInfo, HardwareResponse } from '@/types'

export class HardwareStepService {
  /** The facts frame 2f lists under the GPU name. */
  toSpecs(hardware: HardwareResponse, gpu: GpuInfo): GpuSpec[] {
    return [
      { label: 'VRAM', value: formatter.bytes(gpu.memory) },
      { label: 'CUDA version', value: hardware.cuda_runtime_version },
      { label: 'Compute capability', value: gpu.cuda_compute_capability },
      { label: 'Driver version', value: hardware.nvidia_driver_version }
    ]
  }
}

export const hardwareStepService = new HardwareStepService()
