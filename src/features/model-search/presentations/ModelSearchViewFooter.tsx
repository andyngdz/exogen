import { useDownloadedModels } from '@/cores/hooks'
import { Info } from 'lucide-react'
import { FC, useMemo } from 'react'
import { ModelSearchViewDownloadButton } from './ModelSearchViewDownloadButton'
import { ModelSearchViewDownloadedButton } from './ModelSearchViewDownloadedButton'

export interface ModelSearchViewFooterProps {
  id: string
}

export const ModelSearchViewFooter: FC<ModelSearchViewFooterProps> = ({
  id
}) => {
  const { onCheckDownloaded } = useDownloadedModels()
  const isDownloaded = onCheckDownloaded(id)

  const DownloadButtonStateComponent = useMemo(() => {
    if (isDownloaded) return <ModelSearchViewDownloadedButton />

    return <ModelSearchViewDownloadButton id={id} />
  }, [id, isDownloaded])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-foreground">
          <Info size={16} />
          <span className="text-xs">
            Optimized download: Only essential files are downloaded, saving
            space
          </span>
        </div>
        {DownloadButtonStateComponent}
      </div>
    </div>
  )
}
