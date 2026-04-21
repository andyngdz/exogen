'use client'

import { Button } from '@heroui/react'
import {
  SettingsTab,
  useSettingsStore
} from '@/features/settings/states/useSettingsStore'

export const ModelSearchViewDownloadedButton = () => {
  const { openModal } = useSettingsStore()

  return (
    <Button variant="bordered" onPress={() => openModal(SettingsTab.MODELS)}>
      Manage this model
    </Button>
  )
}
