import { useUpdaterSettings } from '@/features/settings/states'
import { Button } from '@heroui/react'
import { SettingsBase } from '@/features/settings/presentations/SettingsBase'

export const UpdateSettings = () => {
  const { isChecking, onCheck, version } = useUpdaterSettings()

  return (
    <SettingsBase title="Updates" description={`Current version: ${version}`}>
      <Button
        onPress={() => void onCheck()}
        variant="primary"
        isPending={isChecking}
        fullWidth
      >
        {isChecking ? 'Checking…' : 'Check for updates'}
      </Button>
    </SettingsBase>
  )
}
