'use client'

import { useAppShell } from '@/features/app-shell/states/useAppShell'
import { BackendLogDrawer } from '@/features/backend-logs'
import { ModelSearchModal } from '@/features/model-search'
import { SettingsModal } from '@/features/settings/presentations/SettingsModal'
import { FC, PropsWithChildren } from 'react'
import { AppRail } from './AppRail'
import { AppStatusBar } from './AppStatusBar'

/** Rail, page and status bar for the editor, plus the overlays the rail opens. */
export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const {
    isModelSearchOpen,
    onModelSearchOpenChange,
    isLogsOpen,
    onLogsOpenChange,
    isSettingsOpen,
    onSettingsOpenChange
  } = useAppShell()

  return (
    <div className="flex h-full w-full flex-col gap-0">
      <div className="flex min-h-0 flex-1">
        <AppRail />
        <div className="flex min-w-0 flex-1">{children}</div>
      </div>
      <AppStatusBar />
      <ModelSearchModal
        isOpen={isModelSearchOpen}
        onOpenChange={onModelSearchOpenChange}
      />
      <BackendLogDrawer isOpen={isLogsOpen} onOpenChange={onLogsOpenChange} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={onSettingsOpenChange}
      />
    </div>
  )
}
