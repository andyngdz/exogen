import { usePress } from 'react-aria'
import { useHistoryPhotoviewStore } from './useHistoryPhotoviewStore'

export const useHistoryItemPress = (historyId: number) => {
  const openPhotoview = useHistoryPhotoviewStore((state) => state.openPhotoview)
  const { pressProps } = usePress({
    onPress: () => openPhotoview(historyId)
  })

  return pressProps
}
