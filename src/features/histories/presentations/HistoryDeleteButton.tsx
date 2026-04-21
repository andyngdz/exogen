import { dateFormatter } from '@/services'
import { HistoryItem } from '@/types'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure
} from '@heroui/react'
import { Trash2 } from 'lucide-react'
import { FC } from 'react'
import { useDeleteHistory } from '../states/useDeleteHistory'

interface HistoryDeleteButtonProps {
  history: HistoryItem
}

export const HistoryDeleteButton: FC<HistoryDeleteButtonProps> = ({
  history
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const deleteHistory = useDeleteHistory()

  const onConfirm = () => {
    onClose()
    deleteHistory.mutate(history.id)
  }

  return (
    <div>
      <Tooltip content="Delete history">
        <Button
          isIconOnly
          variant="light"
          color="danger"
          aria-label="Delete history"
          onPress={onOpen}
          isDisabled={deleteHistory.isPending}
          data-testid="delete-button"
          size="sm"
        >
          <Trash2 size={16} />
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Delete history</ModalHeader>
          <ModalBody>
            <div>Are you sure you want to delete this history entry?</div>
            <div className="text-danger-500 font-medium">
              {dateFormatter.datetime(`${history.created_at}Z`)}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={deleteHistory.isPending}
              onPress={onConfirm}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
