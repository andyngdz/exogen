import { useDownloadedModels } from '@/cores/hooks'
import { useModelLoadStatus } from '@/features/model-load-progress/states/useModelLoadStatus'
import { ModelFamily, ValueChanged } from '@/types'
import { first } from 'es-toolkit/compat'
import type { Selection } from 'react-aria-components'
import { useModelSelectorStore } from './useModelSelectorStores'
import { useModelSelectors } from './useModelSelectors'

const MODEL_FAMILY_LABELS: Record<ModelFamily, string> = {
  [ModelFamily.UNKNOWN]: '',
  [ModelFamily.SD15]: 'SD 1.5',
  [ModelFamily.SDXL]: 'SDXL',
  [ModelFamily.SD2]: 'SD 2.x',
  [ModelFamily.SD3]: 'SD3',
  [ModelFamily.FLUX]: 'FLUX'
}

export const useModelSelectorMenu = () => {
  useModelSelectors()
  const { downloadedModels } = useDownloadedModels()
  const { isLoading, percentage } = useModelLoadStatus()
  const selectedModelId = useModelSelectorStore(
    (state) => state.selected_model_id
  )
  const loadedModelFamily = useModelSelectorStore(
    (state) => state.loaded_model_family
  )
  const setSelectedModelId = useModelSelectorStore(
    (state) => state.setSelectedModelId
  )

  const onSelectionChange: ValueChanged<Selection> = (keys) => {
    if (keys === 'all') return

    const modelId = first(Array.from(keys))
    if (!modelId) return

    setSelectedModelId(`${modelId}`)
  }

  return {
    downloadedModels,
    selectedModelId,
    familyLabel: MODEL_FAMILY_LABELS[loadedModelFamily],
    isLoading,
    loadPercentLabel: `${percentage}%`,
    onSelectionChange
  }
}
