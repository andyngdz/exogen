import { Switch } from '@heroui/react'
import { useGeneralSettings } from '../../states/useGeneralSettings'
import { SettingsBase } from '../SettingsBase'

export const GeneralSettings = () => {
  const { register } = useGeneralSettings()

  return (
    <SettingsBase
      title="General"
      description="Configure general application settings"
    >
      <Switch {...register('safety_check_enabled')}>Safety check</Switch>
    </SettingsBase>
  )
}
