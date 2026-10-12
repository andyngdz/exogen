'use client'

import { useUpdateCheck } from '@/features/settings/states/useUpdateCheck'
import { Button } from '@heroui/react'
import { RefreshCw } from 'lucide-react'

/** When updates were last checked, and a button to check now. */
export const UpdateSettingsCheck = () => {
  const { isChecking, lastCheckedLabel, onCheck } = useUpdateCheck()

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{lastCheckedLabel}</span>
      <Button
        size="sm"
        variant="tertiary"
        onPress={onCheck}
        isPending={isChecking}
      >
        {!isChecking && <RefreshCw size={14} />}
        {isChecking ? 'Checking…' : 'Check for updates'}
      </Button>
    </div>
  )
}
