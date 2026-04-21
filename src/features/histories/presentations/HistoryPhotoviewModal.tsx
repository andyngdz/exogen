'use client'

import { Modal, ModalBody, ModalContent } from '@heroui/react'
import { useHistoryPhotoviewStore } from '../states/useHistoryPhotoviewStore'
import { HistoryPhotoviewCarousel } from './HistoryPhotoviewCarousel'

export const HistoryPhotoviewModal = () => {
  const { isOpen, currentHistoryId, closePhotoview } =
    useHistoryPhotoviewStore()

  if (!currentHistoryId) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={closePhotoview}
      size="5xl"
      backdrop="blur"
      scrollBehavior="outside"
      aria-label="History photo viewer"
      classNames={{
        body: 'p-0',
        closeButton: 'z-50'
      }}
    >
      <ModalContent>
        <ModalBody>
          <HistoryPhotoviewCarousel currentHistoryId={currentHistoryId} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
