import { useDeleteModel } from '@/features/settings/states/useDeleteModel'
import { Button, Modal } from '@heroui/react'
import { Trash2 } from 'lucide-react'
import { FC, useState } from 'react'

interface DeleteModelButtonProps {
  model_id: string
}

export const DeleteModelButton: FC<DeleteModelButtonProps> = ({ model_id }) => {
  const [isOpen, setIsOpen] = useState(false)
  const deleteModel = useDeleteModel()

  const onConfirm = () => {
    setIsOpen(false)
    deleteModel.mutate(model_id)
  }

  return (
    <div>
      <Button
        isIconOnly
        variant="ghost"
        className="text-danger"
        aria-label={`Delete ${model_id}`}
        onPress={() => setIsOpen(true)}
        isDisabled={deleteModel.isPending}
        data-testid="delete-button"
      >
        <Trash2 size={16} />
      </Button>

      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Delete model</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div>Are you sure you want to delete this model?</div>
                <div className="text-danger font-medium break-all">
                  {model_id}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  isPending={deleteModel.isPending}
                  onPress={onConfirm}
                >
                  Delete
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}
