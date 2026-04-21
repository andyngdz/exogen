import { useDownloadWatcher } from '@/features/download-watcher'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { FC } from 'react'
import { useDownloadButton } from '../states'

export interface ModelSearchViewDownloadButtonProps {
  id: string
}

export const ModelSearchViewDownloadButton: FC<
  ModelSearchViewDownloadButtonProps
> = ({ id }) => {
  const { onDownload } = useDownloadButton(id)
  const { isDownloading } = useDownloadWatcher(id)

  return (
    <Button color="primary" onPress={onDownload} isLoading={isDownloading}>
      <span
        className={clsx({
          'animate-pulse': isDownloading
        })}
      >
        {isDownloading ? 'Downloading' : 'Download this model'}
      </span>
    </Button>
  )
}
