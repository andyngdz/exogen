'use client'

import { useBackendFolder } from '@/features/backend-logs/states'
import { Button, Drawer, DrawerBackdropProps } from '@heroui/react'
import { FolderOpen } from 'lucide-react'
import { FC } from 'react'
import { BackendLogList } from './BackendLogList'

export type BackendLogDrawerProps = Pick<
  DrawerBackdropProps,
  'isOpen' | 'onOpenChange'
>

export const BackendLogDrawer: FC<BackendLogDrawerProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { onOpenBackendFolder } = useBackendFolder()

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
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
