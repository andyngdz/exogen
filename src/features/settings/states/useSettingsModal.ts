import { useSettingsStore } from './useSettingsStore'

export const useSettingsModal = () => {
  const isModalOpen = useSettingsStore((state) => state.isModalOpen)
  const openModal = useSettingsStore((state) => state.openModal)
  const closeModal = useSettingsStore((state) => state.closeModal)

  const onOpen = () => openModal()

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) return

    closeModal()
  }

  return { isModalOpen, onOpen, onOpenChange }
}
