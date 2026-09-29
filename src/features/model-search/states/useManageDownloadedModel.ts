import {
  SettingsTab,
  useSettingsStore
} from '@/features/settings/states/useSettingsStore'

export const useManageDownloadedModel = () => {
  const openModal = useSettingsStore((state) => state.openModal)

  const onManageModel = () => {
    openModal(SettingsTab.MODELS)
  }

  return { onManageModel }
}
