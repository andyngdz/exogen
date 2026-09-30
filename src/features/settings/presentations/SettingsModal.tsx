import { SettingsTab } from '@/features/settings/states/useSettingsStore'
import { useSettingsTabs } from '@/features/settings/states/useSettingsTabs'
import { Modal, ModalBackdropProps, Separator, Tabs } from '@heroui/react'
import { FC } from 'react'
import {
  GeneralSettings,
  MemorySettings,
  ModelManagement,
  UpdateSettings
} from './tabs'

type SettingsModalProps = Pick<ModalBackdropProps, 'isOpen' | 'onOpenChange'>

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { selectedTab, onSelectionChange } = useSettingsTabs()

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Modal.Container size="lg">
        <Modal.Dialog className="max-w-2xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Settings</Modal.Heading>
          </Modal.Header>
          <Separator />
          <Modal.Body>
            <Tabs
              orientation="vertical"
              align="start"
              className="min-h-[80vh]"
              selectedKey={selectedTab}
              onSelectionChange={onSelectionChange}
            >
              <Tabs.ListContainer className="border-r border-border">
                <Tabs.List
                  aria-label="Settings tabs"
                  className="whitespace-nowrap"
                >
                  <Tabs.Tab id={SettingsTab.GENERAL}>
                    General
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id={SettingsTab.MEMORY}>
                    Memory
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id={SettingsTab.MODELS}>
                    Model Management
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id={SettingsTab.UPDATES}>
                    Updates
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel id={SettingsTab.GENERAL} className="w-full">
                <GeneralSettings />
              </Tabs.Panel>
              <Tabs.Panel id={SettingsTab.MEMORY} className="w-full">
                <MemorySettings />
              </Tabs.Panel>
              <Tabs.Panel id={SettingsTab.MODELS} className="w-full">
                <ModelManagement />
              </Tabs.Panel>
              <Tabs.Panel id={SettingsTab.UPDATES} className="w-full">
                <UpdateSettings />
              </Tabs.Panel>
            </Tabs>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
