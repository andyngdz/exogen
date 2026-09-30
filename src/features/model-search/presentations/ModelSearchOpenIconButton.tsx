import { Button, Modal, Separator } from '@heroui/react'
import { Plus } from 'lucide-react'
import { ModelSearchContainer } from './ModelSearchContainer'

export const ModelSearchOpenIconButton = () => {
  return (
    <section>
      <Modal>
        <Button
          variant="ghost"
          className="text-accent"
          isIconOnly
          aria-label="Open model search"
        >
          <Plus />
        </Button>
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
