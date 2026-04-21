'use client'

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure
} from '@heroui/react'
import { FolderOpen, SquareChevronRight } from 'lucide-react'
import { useBackendFolder } from '../states'
import { BackendLogList } from './BackendLogList'

export const BackendLog = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { onOpenBackendFolder } = useBackendFolder()

  return (
    <section>
      <Button
        variant="light"
        className="text-default-700"
        onPress={onOpen}
        endContent={<SquareChevronRight size={16} />}
      >
        Console
      </Button>
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="5xl">
        <DrawerContent>
          <DrawerHeader className="flex items-center gap-2">
            Backend Logs
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={onOpenBackendFolder}
              aria-label="Open backend folder"
            >
              <FolderOpen size={16} />
            </Button>
          </DrawerHeader>
          <DrawerBody className="p-0">
            <BackendLogList />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </section>
  )
}
