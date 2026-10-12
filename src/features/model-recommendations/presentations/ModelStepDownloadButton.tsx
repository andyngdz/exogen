'use client'

import { useModelStepDownload } from '@/features/model-recommendations/states/useModelStepDownload'
import { Button } from '@heroui/react'
import { ArrowRight, Download } from 'lucide-react'

/** Downloads the picked model; the label follows the download until it completes. */
export const ModelStepDownloadButton = () => {
  const { label, isDownloading, isDisabled, onDownload } =
    useModelStepDownload()

  return (
    <Button
      variant="primary"
      isDisabled={isDisabled}
      isPending={isDownloading}
      onPress={onDownload}
    >
      <Download size={16} />
      {label}
      <ArrowRight size={16} />
    </Button>
  )
}
