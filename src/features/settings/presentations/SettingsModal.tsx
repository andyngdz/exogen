import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs
} from '@heroui/react'
import { FC } from 'react'
import { SettingsTab, useSettingsStore } from '../states/useSettingsStore'
import {
  GeneralSettings,
  MemorySettings,
  ModelManagement,
  UpdateSettings
} from './tabs'

interface SettingsModalProps {
  isOpen: boolean
  onClose: VoidFunction
}

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { selectedTab, setSelectedTab } = useSettingsStore()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
        <Divider />
        <ModalBody className="p-0">
          <Tabs
            aria-label="Settings tabs"
            variant="light"
            className="min-h-[80vh]"
            classNames={{
              base: 'border-r border-default p-4',
              tab: 'justify-start',
              panel: 'w-full p-4'
            }}
            isVertical
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as SettingsTab)}
          >
            <Tab key={SettingsTab.GENERAL} title="General">
              <GeneralSettings />
            </Tab>
            <Tab key={SettingsTab.MEMORY} title="Memory">
              <MemorySettings />
            </Tab>
            <Tab key={SettingsTab.MODELS} title="Model Management">
              <ModelManagement />
            </Tab>
            <Tab key={SettingsTab.UPDATES} title="Updates">
              <UpdateSettings />
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
