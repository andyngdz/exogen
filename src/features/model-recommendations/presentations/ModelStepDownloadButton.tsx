import { useRecommendationDownload } from '@/features/model-recommendations/states/useRecommendationDownload'
import { ModelRecommendationItem } from '@/types/api'
import { Button } from '@heroui/react'
import { ArrowRight, Download } from 'lucide-react'
import { FC } from 'react'

interface ModelStepDownloadButtonProps {
  model: ModelRecommendationItem
}

/** Downloads the picked model; the label follows the download until it completes. */
export const ModelStepDownloadButton: FC<ModelStepDownloadButtonProps> = ({
  model
}) => {
  const { progressPercent, isDownloading, isDisabled, onDownload } =
    useRecommendationDownload(model.id)

  const label = isDownloading
    ? `Downloading ${Math.round(progressPercent)}%`
    : `Download ${model.name}`

  return (
    <Button
      variant="primary"
      isDisabled={isDisabled}
      isPending={isDownloading}
      onPress={() => void onDownload()}
    >
      <Download size={16} />
      {label}
      <ArrowRight size={16} />
    </Button>
  )
}
