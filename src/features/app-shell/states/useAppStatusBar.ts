import { useHardwareMemoryQuery, useHardwareQuery } from '@/cores/api-queries'
import {
  SocketConnectionStatus,
  useSocketConnectionStore
} from '@/cores/sockets'
import { appStatusService } from '@/features/app-shell/services/app-status'
import { useDownloadWatcherStore } from '@/features/download-watcher/states/useDownloadWatchStore'

/** Everything the status bar shows; GPU and VRAM come from the backend, so they hide while it is not connected. */
export const useAppStatusBar = () => {
  const connectionStatus = useSocketConnectionStore((state) => state.status)
  const { data: hardware } = useHardwareQuery()
  const { data: memory } = useHardwareMemoryQuery()
  const downloadModelId = useDownloadWatcherStore((state) => state.model_id)
  const downloadStep = useDownloadWatcherStore((state) => state.step)

  const isConnected = connectionStatus === SocketConnectionStatus.CONNECTED

  return {
    backendStatus: appStatusService.toBackendStatus(connectionStatus),
    download: appStatusService.toDownload(downloadModelId, downloadStep),
    ...(isConnected && {
      gpuLabel: appStatusService.toGpuLabel(hardware),
      vramUsage: appStatusService.toVramUsage(memory)
    })
  }
}
