import { useUpdaterSettings } from '@/features/settings/states'
import { Button } from '@heroui/react'
import { RefreshCw } from 'lucide-react'
import { SettingsBase } from '@/features/settings/presentations/SettingsBase'
import { UpdateReadyCard } from './UpdateReadyCard'

export const UpdateSettings = () => {
  const {
    downloadedVersion,
    hasPendingUpdate,
    isChecking,
    lastCheckedLabel,
    onCheck,
    onInstall,
    onLater,
    version
  } = useUpdaterSettings()

  return (
    <SettingsBase title="Updates" description={`Current version: ${version}`}>
      {hasPendingUpdate && downloadedVersion && (
        <UpdateReadyCard
          version={downloadedVersion}
          onLater={onLater}
          onInstall={onInstall}
        />
      )}
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted">{lastCheckedLabel}</span>
        <Button
          size="sm"
          variant="tertiary"
          onPress={() => void onCheck()}
          isPending={isChecking}
        >
          {!isChecking && <RefreshCw size={14} />}
          {isChecking ? 'Checking…' : 'Check for updates'}
        </Button>
      </div>
    </SettingsBase>
  )
}
