import { Separator } from '@heroui/react'
import { FC } from 'react'
import { ModelDownloadStatusInfo } from './ModelDownloadStatusInfo'
import { ModelDownloadStatusLineIndicator } from './ModelDownloadStatusLineIndicator'

export interface ModelDownloadStatusLineProps {
  id: string
}

export const ModelDownloadStatusLine: FC<ModelDownloadStatusLineProps> = ({
  id
}) => {
  return (
    <div className="flex flex-col gap-2">
      <ModelDownloadStatusInfo id={id} />
      <div className="relative w-full">
        <Separator className="h-1" />
        <ModelDownloadStatusLineIndicator id={id} />
      </div>
    </div>
  )
}
