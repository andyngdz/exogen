import { GpuSpec } from '@/features/gpu-detection/types/gpu-detection'
import { formatter } from '@/services'
import { GpuInfo, HardwareResponse } from '@/types'
import { findIndex } from 'es-toolkit/compat'

export class HardwareStepService {
  /** The primary GPU's device index (its array position), or 0 when none is primary. */
  toPrimaryIndex(hardware?: HardwareResponse) {
    return Math.max(findIndex(hardware?.gpus, { is_primary: true }), 0)
  }

  /** The GPU at the picked device index, if the hardware has one there. */
  toSelectedGpu(gpuIndex: number, hardware?: HardwareResponse) {
    return hardware?.gpus.at(gpuIndex)
  }

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
