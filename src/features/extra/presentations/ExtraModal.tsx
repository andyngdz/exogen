import { LoraList } from '@/features/extra-loras/presentations'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalProps,
  Tab,
  Tabs
} from '@heroui/react'
import { FC } from 'react'

export const ExtraModal: FC<Omit<ModalProps, 'children'>> = (props) => {
  return (
    <Modal placement="center" size="2xl" scrollBehavior="inside" {...props}>
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          Extra Networks
        </ModalHeader>
        <ModalBody>
          <Tabs>
            <Tab key="lora" title="LoRA">
              <LoraList />
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
