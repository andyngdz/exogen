'use client'

import { SettingsBase } from '@/features/settings/presentations/SettingsBase'
import { useLoadAppVersion } from '@/features/settings/states/useAppVersion'
import { useHasPendingUpdate } from '@/features/settings/states/useUpdaterStore'
import { UpdateReadyCard } from './UpdateReadyCard'
import { UpdateSettingsCheck } from './UpdateSettingsCheck'
import { UpdateSettingsVersion } from './UpdateSettingsVersion'

/** The Updates section: a downloaded update to install, and a manual check. */
export const UpdateSettings = () => {
  useLoadAppVersion()
  const hasPendingUpdate = useHasPendingUpdate()

  return (
    <SettingsBase title="Updates" description={<UpdateSettingsVersion />}>
      {hasPendingUpdate && <UpdateReadyCard />}
      <UpdateSettingsCheck />
    </SettingsBase>
  )
}
