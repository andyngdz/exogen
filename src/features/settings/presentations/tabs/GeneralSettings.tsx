import { useGeneralSettings } from '@/features/settings/states/useGeneralSettings'
import { Switch } from '@heroui/react'
import { SettingsBase } from '@/features/settings/presentations/SettingsBase'

export const GeneralSettings = () => {
  const { isSafetyCheckEnabled, onSafetyCheckChange } = useGeneralSettings()

  return (
    <SettingsBase
      title="General"
      description="Configure general application settings"
    >
      <Switch isSelected={isSafetyCheckEnabled} onChange={onSafetyCheckChange}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Safety check
        </Switch.Content>
      </Switch>
    </SettingsBase>
  )
}
