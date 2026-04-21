import { useMemo } from 'react'
import { useDownloadWatcherStore } from './useDownloadWatchStore'

export const useDownloadWatcher = (watchId: string) => {
  const { model_id, step } = useDownloadWatcherStore()
  const isDownloading = model_id === watchId

  const percent = useMemo(() => {
    if (step && step.total_downloaded_size > 0) {
      return step.downloaded_size / step.total_downloaded_size
    }

    return 0
  }, [step])

  const downloadSized = useMemo(() => {
    if (step) {
      return step.downloaded_size
    }

    return 0
  }, [step])

  const downloadTotalSized = useMemo(() => {
    if (step) {
      return step.total_downloaded_size
    }

    return 0
  }, [step])

  const currentFile = useMemo(() => {
    if (step) {
      return step.current_file
    }

    return 'N/A'
  }, [step])

  return {
    isDownloading,
    step,
    percent,
    downloadSized,
    downloadTotalSized,
    currentFile
  }
}
