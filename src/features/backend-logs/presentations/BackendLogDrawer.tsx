'use client'

import {
  BACKEND_LOG_DRAWER_ACTIONS,
  useBackendFolder,
  useBackendLogDrawerStore
} from '@/features/backend-logs/states'
import { Button, Drawer } from '@heroui/react'
import { FolderOpen } from 'lucide-react'
import { BackendLogList } from './BackendLogList'

/** The backend log drawer; open it with BACKEND_LOG_DRAWER_ACTIONS.open. */
export const BackendLogDrawer = () => {
  const isOpen = useBackendLogDrawerStore((state) => state.isOpen)
  const { onOpenBackendFolder } = useBackendFolder()

  return (
    <Drawer.Backdrop
      isOpen={isOpen}
      onOpenChange={BACKEND_LOG_DRAWER_ACTIONS.setOpen}
    >
      <Drawer.Content placement="right">
        <Drawer.Dialog className="w-full max-w-5xl">
          <Drawer.CloseTrigger />
          <Drawer.Header className="flex flex-row items-center gap-2">
            <Drawer.Heading>Backend Logs</Drawer.Heading>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={onOpenBackendFolder}
              aria-label="Open backend folder"
            >
              <FolderOpen size={16} />
            </Button>
          </Drawer.Header>
          <Drawer.Body className="p-0">
            <BackendLogList />
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
