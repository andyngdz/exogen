import { useHistoryPhotoviewStore } from './useHistoryPhotoviewStore'

export const useHistoryPhotoviewModalModel = () => {
  const isOpen = useHistoryPhotoviewStore((state) => state.isOpen)
  const currentHistoryId = useHistoryPhotoviewStore(
    (state) => state.currentHistoryId
  )
  const closePhotoview = useHistoryPhotoviewStore(
    (state) => state.closePhotoview
  )

  const onOpenChange = (isNextOpen: boolean) => {
    if (isNextOpen) return

    closePhotoview()
  }

  return { isOpen, currentHistoryId, onOpenChange }
}
