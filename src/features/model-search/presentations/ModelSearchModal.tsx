import { Modal, ModalBackdropProps, Separator } from '@heroui/react'
import { FC } from 'react'
import { ModelSearchContainer } from './ModelSearchContainer'

export type ModelSearchModalProps = Pick<
  ModalBackdropProps,
  'isOpen' | 'onOpenChange'
>

export const ModelSearchModal: FC<ModelSearchModalProps> = ({
  isOpen,
  onOpenChange
}) => {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="full" scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Model search</Modal.Heading>
          </Modal.Header>
          <Separator />
          <Modal.Body className="p-0">
            <ModelSearchContainer />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
