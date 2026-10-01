'use client'

import { SettingsTab } from '@/features/settings/states/useSettingsStore'
import { useSettingsTabs } from '@/features/settings/states/useSettingsTabs'
import { useHasPendingUpdate } from '@/features/settings/states/useUpdaterStore'
import { Tabs } from '@heroui/react'
import clsx from 'clsx'
import {
  HardDrive,
  MemoryStick,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react'
import { SettingsNavTab } from './SettingsNavTab'
import { UpdatePendingDot } from './UpdatePendingDot'
import {
  GeneralSettings,
  MemorySettings,
  ModelManagement,
  UpdateSettings
} from './tabs'

/** Settings as a full rail view: section nav on the left, the section on the right. */
export const SettingsView = () => {
  const { selectedTab, onSelectionChange } = useSettingsTabs()
  const hasPendingUpdate = useHasPendingUpdate()

  return (
    <Tabs
      orientation="vertical"
      variant="secondary"
      selectedKey={selectedTab}
      onSelectionChange={onSelectionChange}
      className="w-full"
    >
      <div
        className={clsx(
          'flex flex-col gap-4',
          'w-55 shrink-0 px-2 py-6',
          'border-r border-separator'
        )}
      >
        <h1 className="px-4 text-base font-semibold">Settings</h1>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Settings sections" className="w-full">
            <SettingsNavTab
              id={SettingsTab.GENERAL}
              label="General"
              icon={SlidersHorizontal}
            />
            <SettingsNavTab
              id={SettingsTab.MEMORY}
              label="Memory"
              icon={MemoryStick}
            />
            <SettingsNavTab
              id={SettingsTab.MODELS}
              label="Model management"
              icon={HardDrive}
            />
            <SettingsNavTab
              id={SettingsTab.UPDATES}
              label="Updates"
              icon={RefreshCw}
              indicator={hasPendingUpdate && <UpdatePendingDot />}
            />
          </Tabs.List>
        </Tabs.ListContainer>
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-160">
          <Tabs.Panel id={SettingsTab.GENERAL}>
            <GeneralSettings />
          </Tabs.Panel>
          <Tabs.Panel id={SettingsTab.MEMORY}>
            <MemorySettings />
          </Tabs.Panel>
          <Tabs.Panel id={SettingsTab.MODELS}>
            <ModelManagement />
          </Tabs.Panel>
          <Tabs.Panel id={SettingsTab.UPDATES}>
            <UpdateSettings />
          </Tabs.Panel>
        </div>
      </div>
    </Tabs>
  )
}
