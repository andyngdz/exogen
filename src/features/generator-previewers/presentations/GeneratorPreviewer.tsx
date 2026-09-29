import { ImageViewMode } from '@/features/generator-previewers/states/useImageViewModeStore'
import { useImageViewMode } from '@/features/generator-previewers/states/useImageViewMode'
import { ReactNode } from 'react'
import { GeneratorPreviewerGrid } from './GeneratorPreviewerGrid'
import { GeneratorPreviewerCarousel } from './GeneratorPreviewerCarousel'

interface GeneratorPreviewerProps {
  leadingItem?: ReactNode
}

export const GeneratorPreviewer = ({
  leadingItem
}: GeneratorPreviewerProps) => {
  const { viewMode } = useImageViewMode()

  if (viewMode === ImageViewMode.SLIDER) {
    return <GeneratorPreviewerCarousel leadingItem={leadingItem} />
  }

  return <GeneratorPreviewerGrid leadingItem={leadingItem} />
}
