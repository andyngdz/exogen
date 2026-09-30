import { LoraList } from '@/features/extra-loras/presentations'
import { Modal, ModalBackdropProps, Tabs } from '@heroui/react'
import { FC } from 'react'

export type ExtraModalProps = Pick<
  ModalBackdropProps,
  'isOpen' | 'onOpenChange'
>

export const ExtraModal: FC<ExtraModalProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="center" size="lg" scroll="inside">
        <Modal.Dialog className="max-w-2xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Extra Networks</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Tabs>
              <Tabs.ListContainer className="w-fit">
                <Tabs.List aria-label="Extra networks">
                  <Tabs.Tab id="lora">
                    LoRA
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel id="lora">
                <LoraList />
              </Tabs.Panel>
            </Tabs>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
