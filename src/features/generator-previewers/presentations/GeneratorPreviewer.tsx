import { ReactNode } from 'react'
import { useImageViewModeStore } from '../states/useImageViewModeStore'
import { GeneratorPreviewerGrid } from './GeneratorPreviewerGrid'
import { GeneratorPreviewerSlider } from './GeneratorPreviewerSlider'

interface GeneratorPreviewerProps {
  leadingItem?: ReactNode
}

export const GeneratorPreviewer = ({
  leadingItem
}: GeneratorPreviewerProps) => {
  const { viewMode } = useImageViewModeStore()

  if (viewMode === 'slider') {
    return <GeneratorPreviewerSlider leadingItem={leadingItem} />
  }

  return <GeneratorPreviewerGrid leadingItem={leadingItem} />
}
