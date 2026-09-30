import { useDeleteHistory } from '@/features/histories/states/useDeleteHistory'
import { dateFormatter } from '@/services'
import { HistoryItem } from '@/types'
import { Button, Modal, Tooltip, useOverlayState } from '@heroui/react'
import { Trash2 } from 'lucide-react'
import { FC } from 'react'

interface HistoryDeleteButtonProps {
  history: HistoryItem
}

export const HistoryDeleteButton: FC<HistoryDeleteButtonProps> = ({
  history
}) => {
  const confirmState = useOverlayState()
  const deleteHistory = useDeleteHistory()

  const onConfirm = () => {
    confirmState.close()
    deleteHistory.mutate(history.id)
  }

  return (
    <Modal state={confirmState}>
      <Tooltip delay={0}>
        <Button
          isIconOnly
          variant="ghost"
          className="text-danger"
          aria-label="Delete history"
          isDisabled={deleteHistory.isPending}
          data-testid="delete-button"
          size="sm"
        >
          <Trash2 size={16} />
        </Button>
        <Tooltip.Content>Delete history</Tooltip.Content>
      </Tooltip>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Delete history</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div>Are you sure you want to delete this history entry?</div>
              <div className="text-danger font-medium">
                {dateFormatter.datetime(`${history.created_at}Z`)}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={confirmState.close}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isPending={deleteHistory.isPending}
                onPress={onConfirm}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
