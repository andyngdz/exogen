import { ImageViewMode } from '@/features/generator-previewers/states/useImageViewModeStore'
import { TopBarOption } from '@/features/generators/types'
import { GeneratorMode } from '@/types'
import { Grid2x2, Square } from 'lucide-react'

export const TOP_BAR_MODE_OPTIONS: TopBarOption[] = [
  { id: GeneratorMode.TEXT_2_IMAGE, label: 'Text to image' },
  { id: GeneratorMode.IMAGE_2_IMAGE, label: 'Image to image' }
]

export const TOP_BAR_VIEW_OPTIONS: TopBarOption[] = [
  { id: ImageViewMode.SLIDER, label: 'Single view', icon: Square },
  { id: ImageViewMode.GRID, label: 'Grid view', icon: Grid2x2 }
]
