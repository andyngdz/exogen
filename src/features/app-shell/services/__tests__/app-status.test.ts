import { SocketConnectionStatus } from '@/cores/sockets'
import { appStatusService } from '@/features/app-shell/services/app-status'
import { StatusTone } from '@/features/app-shell/types'
import { AcceleratorMemoryDevice, HardwareResponse } from '@/types'
import { describe, expect, it } from 'vitest'

const hardware = (cuda_runtime_version: string): HardwareResponse => ({
  is_cuda: cuda_runtime_version !== '0',
  cuda_runtime_version,
  nvidia_driver_version: '560.94',
  message: '',
  gpus: [
    {
      name: 'NVIDIA GeForce RTX 4070',
      memory: 12,
      cuda_compute_capability: '8.9',
      is_primary: true
    }
  ]
})

describe('appStatusService', () => {
  it('maps each connection status to a label and tone', () => {
    expect(
      appStatusService.toBackendStatus(SocketConnectionStatus.CONNECTED)
    ).toEqual({ label: 'Backend ready', tone: StatusTone.SUCCESS })
    expect(
      appStatusService.toBackendStatus(SocketConnectionStatus.CONNECTING)
    ).toEqual({ label: 'Connecting to backend', tone: StatusTone.WARNING })
    expect(
      appStatusService.toBackendStatus(SocketConnectionStatus.DISCONNECTED)
    ).toEqual({ label: 'Backend offline', tone: StatusTone.DANGER })
  })

  it('names the primary GPU with its CUDA version', () => {
    expect(appStatusService.toGpuLabel(hardware('12.4'))).toBe(
      'NVIDIA GeForce RTX 4070 · CUDA 12.4'
    )
  })

  it('leaves out CUDA when the backend reports none', () => {
    expect(appStatusService.toGpuLabel(hardware('0'))).toBe(
      'NVIDIA GeForce RTX 4070'
    )
    expect(appStatusService.toGpuLabel(hardware(''))).toBe(
      'NVIDIA GeForce RTX 4070'
    )
    expect(appStatusService.toGpuLabel(undefined)).toBeUndefined()
  })

  it('reports VRAM in use, or nothing when total is zero', () => {
    expect(
      appStatusService.toVramUsage({
        device: AcceleratorMemoryDevice.CUDA,
        used_bytes: 9.1 * 1024 ** 3,
        total_bytes: 12 * 1024 ** 3
      })
    ).toEqual({ percent: 76, label: '9.1 / 12.0 GB' })
    expect(
      appStatusService.toVramUsage({
        device: AcceleratorMemoryDevice.CPU,
        used_bytes: 0,
        total_bytes: 0
      })
    ).toBeUndefined()
    expect(appStatusService.toVramUsage(undefined)).toBeUndefined()
  })

  it('reports an active download', () => {
    expect(
      appStatusService.toDownload('stabilityai/sdxl-turbo', {
        model_id: 'stabilityai/sdxl-turbo',
        step: 3,
        total: 7,
        downloaded_size: 42,
        total_downloaded_size: 100,
        phase: 'downloading'
      })
    ).toEqual({ modelId: 'stabilityai/sdxl-turbo', percent: 42, label: '42%' })
    expect(appStatusService.toDownload(undefined, undefined)).toBeUndefined()
  })
})
