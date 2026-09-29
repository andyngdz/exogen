import { useDownloadWatcher } from '@/features/download-watcher'
import { useDownloadButton } from '@/features/model-search/states'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { FC } from 'react'

export interface ModelSearchViewDownloadButtonProps {
  id: string
}

export const ModelSearchViewDownloadButton: FC<
  ModelSearchViewDownloadButtonProps
> = ({ id }) => {
  const { onDownload } = useDownloadButton(id)
  const { isDownloading } = useDownloadWatcher(id)

  return (
    <Button variant="primary" onPress={onDownload} isPending={isDownloading}>
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
