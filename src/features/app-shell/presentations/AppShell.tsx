'use client'

import { useAppShell } from '@/features/app-shell/states/useAppShell'
import { AppView } from '@/features/app-shell/types'
import { BackendLogView } from '@/features/backend-logs/presentations/BackendLogView'
import { HistoryView } from '@/features/histories/presentations/HistoryView'
import { ModelSearchModal } from '@/features/model-search'
import { SettingsView } from '@/features/settings/presentations/SettingsView'
import clsx from 'clsx'
import { FC, PropsWithChildren } from 'react'
import { AppRail } from './AppRail'
import { AppStatusBar } from './AppStatusBar'

const RAIL_VIEWS: Partial<Record<AppView, FC>> = {
  [AppView.HISTORY]: HistoryView,
  [AppView.LOGS]: BackendLogView,
  [AppView.SETTINGS]: SettingsView
}

/**
 * Rail, the open view and the status bar. The generator (children) stays
 * mounted behind other views, so a run keeps streaming and the form keeps its
 * values while the user looks elsewhere.
 */
export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const {
    activeView,
    isGenerateView,
    isModelSearchOpen,
    onModelSearchOpenChange
  } = useAppShell()
  const RailView = RAIL_VIEWS[activeView]

  return (
    <div className="flex h-full w-full flex-col gap-0">
      <div className="flex min-h-0 flex-1">
        <AppRail />
        <div
          className={clsx('flex min-w-0 flex-1', { hidden: !isGenerateView })}
        >
          {children}
        </div>
        {RailView && (
          <div className="flex min-w-0 flex-1">
            <RailView />
          </div>
        )}
      </div>
      <AppStatusBar />
      <ModelSearchModal
        isOpen={isModelSearchOpen}
        onOpenChange={onModelSearchOpenChange}
      />
    </div>
  )
}
