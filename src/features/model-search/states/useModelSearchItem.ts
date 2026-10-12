import { usePress } from 'react-aria'
import {
  onUpdateModelId,
  useModelSearchSelectorStore
} from './useModelSearchSelectorStores'

export const useModelSearchItem = (modelId: string) => {
  const selectedModelId = useModelSearchSelectorStore((state) => state.model_id)
  const { pressProps } = usePress({ onPress: () => onUpdateModelId(modelId) })

  return { isSelected: selectedModelId === modelId, pressProps }
}
