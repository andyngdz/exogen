import { useGeneratorModeTabs } from '@/features/generator-modes/states/useGeneratorModeTabs'
import { useImageViewMode } from '@/features/generator-previewers/states/useImageViewMode'
import { selectionService } from '@/features/generators/services/selection'
import { ValueChanged } from '@/types'
import type { Selection } from 'react-aria-components'

/** Mode and view switches for the top bar, as single-select toggle groups. */
export const useGeneratorTopBar = () => {
  const { mode, onModeChange } = useGeneratorModeTabs()
  const { viewMode, onViewModeChange } = useImageViewMode()

  const onModeSelectionChange: ValueChanged<Selection> = (selection) => {
    const key = selectionService.toSelectedKey(selection)
    if (key) onModeChange(key)
  }

  const onViewSelectionChange: ValueChanged<Selection> = (selection) => {
    const key = selectionService.toSelectedKey(selection)
    if (key) onViewModeChange(key)
  }

  return {
    mode,
    viewMode,
    onModeSelectionChange,
    onViewSelectionChange
  }
}
