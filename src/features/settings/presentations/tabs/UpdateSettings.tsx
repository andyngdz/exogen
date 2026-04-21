import { Button } from '@heroui/react'
import { useUpdaterSettings } from '../../states'
import { SettingsBase } from '../SettingsBase'

export const UpdateSettings = () => {
  const { isChecking, onCheck, version } = useUpdaterSettings()

  return (
    <SettingsBase title="Updates" description={`Current version: ${version}`}>
      <Button onPress={onCheck} color="primary" isLoading={isChecking}>
        {isChecking ? 'Checking…' : 'Check for updates'}
      </Button>
    </SettingsBase>
  )
}
