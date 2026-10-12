import {
  useDownloadWatcher,
  useDownloadWatcherStore
} from '@/features/download-watcher'
import { api } from '@/services'

export const useRecommendationDownload = (modelId: string) => {
  const downloadingModelId = useDownloadWatcherStore((state) => state.model_id)
  const { percent, isDownloading, downloadSized, downloadTotalSized } =
    useDownloadWatcher(modelId)
  const isOtherModelDownloading =
    !!downloadingModelId && modelId !== downloadingModelId

  const onDownload = async () => {
    await api.downloadModel(modelId)
  }

  return {
    progressPercent: percent * 100,
    isDownloading,
    isDisabled: isDownloading || isOtherModelDownloading,
    downloadSized,
    downloadTotalSized,
    onDownload
  }
}
