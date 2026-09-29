'use client'

import { useRecommendationDownload } from '@/features/model-recommendations/states/useRecommendationDownload'
import { formatter } from '@/services'
import { Button, ProgressBar } from '@heroui/react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import { FC } from 'react'

interface ModelRecommendationsDownloadButtonProps {
  modelId: string
}

export const ModelRecommendationsDownloadButton: FC<
  ModelRecommendationsDownloadButtonProps
> = ({ modelId }) => {
  const {
    progressPercent,
    isDownloading,
    isDisabled,
    downloadSized,
    downloadTotalSized,
    onDownload
  } = useRecommendationDownload(modelId)

  return (
    <div className="relative overflow-hidden rounded-lg w-full">
      {isDownloading && (
        <div className="absolute inset-0">
          <ProgressBar aria-label="Download progress" value={progressPercent}>
            <ProgressBar.Track className="h-full rounded-lg bg-transparent">
              <ProgressBar.Fill className="bg-accent/30" />
            </ProgressBar.Track>
          </ProgressBar>
        </div>
      )}
      <Button
        variant={isDownloading ? 'outline' : 'tertiary'}
        isDisabled={isDisabled}
        onPress={onDownload}
        className="w-full relative z-10"
        size="sm"
      >
        {!isDownloading && <ChevronDown size={16} />}
        <span
          className={clsx('font-semibold', {
            'animate-pulse': isDownloading,
            'text-foreground': isDownloading
          })}
        >
          {isDownloading
            ? `${formatter.bytes(downloadSized)} / ${formatter.bytes(
                downloadTotalSized
              )}`
            : 'Download Model'}
        </span>
      </Button>
    </div>
  )
}
