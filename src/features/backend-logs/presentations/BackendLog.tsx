'use client'

import { Button, Drawer } from '@heroui/react'
import { FolderOpen, SquareChevronRight } from 'lucide-react'
import { useBackendFolder } from '@/features/backend-logs/states'
import { BackendLogList } from './BackendLogList'

export const BackendLog = () => {
  const { onOpenBackendFolder } = useBackendFolder()

  return (
    <section>
      <Drawer>
        <Button variant="ghost" className="text-foreground">
          Console
          <SquareChevronRight size={16} />
        </Button>
        <Drawer.Backdrop>
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
      </Drawer>
    </section>
  )
}
