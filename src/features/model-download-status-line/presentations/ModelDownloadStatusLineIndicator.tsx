import { useDownloadWatcher } from '@/features/download-watcher'
import { ProgressBar } from '@heroui/react'
import { FC } from 'react'

export interface ModelDownloadStatusLineIndicatorProps {
  id: string
}

export const ModelDownloadStatusLineIndicator: FC<
  ModelDownloadStatusLineIndicatorProps
> = ({ id }) => {
  const { percent } = useDownloadWatcher(id)

  if (percent <= 0) return

  return (
    <div className="absolute inset-0 h-1">
      <ProgressBar aria-label="Download progress" value={percent * 100}>
        <ProgressBar.Track className="h-1">
          <ProgressBar.Fill className="bg-accent" />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  )
}
