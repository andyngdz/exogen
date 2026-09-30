import {
  DownloadStepProgressResponse,
  SocketConnectionStatus
} from '@/cores/sockets'
import {
  BackendStatusView,
  DownloadView,
  StatusTone,
  UsageView
} from '@/features/app-shell/types'
import { HardwareMemoryResponse, HardwareResponse } from '@/types'
import { find } from 'es-toolkit/compat'

const BYTES_PER_GB = 1024 ** 3
// The backend reports this CUDA version when no NVIDIA GPU is present.
const NO_CUDA_VERSION = '0'

const BACKEND_STATUS_VIEWS: Record<SocketConnectionStatus, BackendStatusView> =
  {
    [SocketConnectionStatus.CONNECTED]: {
      label: 'Backend ready',
      tone: StatusTone.SUCCESS
    },
    [SocketConnectionStatus.CONNECTING]: {
      label: 'Connecting to backend',
      tone: StatusTone.WARNING
    },
    [SocketConnectionStatus.DISCONNECTED]: {
      label: 'Backend offline',
      tone: StatusTone.DANGER
    }
  }

const toPercent = (part: number, whole: number) =>
  Math.round((part / whole) * 100)

const toGb = (bytes: number) => (bytes / BYTES_PER_GB).toFixed(1)

export class AppStatusService {
  toBackendStatus(status: SocketConnectionStatus) {
    return BACKEND_STATUS_VIEWS[status]
  }

  /** Primary GPU name, with "CUDA x.y" when the backend reports one. */
  toGpuLabel(hardware?: HardwareResponse) {
    const gpu = find(hardware?.gpus, (candidate) => candidate.is_primary)
    if (!gpu) return

    const cudaVersion = hardware?.cuda_runtime_version
    if (!cudaVersion || cudaVersion === NO_CUDA_VERSION) return gpu.name

    return `${gpu.name} · CUDA ${cudaVersion}`
  }

  /** VRAM in use; undefined when the backend has no accelerator memory to report. */
  toVramUsage(memory?: HardwareMemoryResponse): UsageView | undefined {
    if (!memory?.total_bytes) return

    return {
      percent: toPercent(memory.used_bytes, memory.total_bytes),
      label: `${toGb(memory.used_bytes)} / ${toGb(memory.total_bytes)} GB`
    }
  }

  toDownload(
    modelId?: string,
    step?: DownloadStepProgressResponse
  ): DownloadView | undefined {
    if (!modelId || !step?.total_downloaded_size) return

    const percent = toPercent(step.downloaded_size, step.total_downloaded_size)
    return { modelId, percent, label: `${percent}%` }
  }
}

export const appStatusService = new AppStatusService()
