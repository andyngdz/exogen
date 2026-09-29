import { ValueChanged } from '@/types'
import { find, values } from 'es-toolkit/compat'
import type { Key } from 'react-aria-components'
import {
  IMAGE_VIEW_MODE_ACTIONS,
  ImageViewMode,
  useImageViewModeStore
} from './useImageViewModeStore'

export const useImageViewMode = () => {
  const viewMode = useImageViewModeStore((state) => state.viewMode)

  const onViewModeChange: ValueChanged<Key | null> = (key) => {
    const nextViewMode = find(values(ImageViewMode), (mode) => mode === key)
    if (!nextViewMode) return

    IMAGE_VIEW_MODE_ACTIONS.setViewMode(nextViewMode)
  }

  return { viewMode, onViewModeChange }
}
