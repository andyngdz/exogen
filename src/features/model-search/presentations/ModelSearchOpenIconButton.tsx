import { Button, Modal, Separator, useOverlayState } from '@heroui/react'
import { Plus } from 'lucide-react'
import { ModelSearchContainer } from './ModelSearchContainer'

export const ModelSearchOpenIconButton = () => {
  const modalState = useOverlayState()

  return (
    <section>
      <Button
        onPress={modalState.open}
        variant="ghost"
        className="text-accent"
        isIconOnly
        aria-label="Open model search"
      >
        <Plus />
      </Button>
      <Modal state={modalState}>
        <Modal.Backdrop>
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
      </Modal>
    </section>
  )
}
