'use client'

import { useHistoryPhotoviewModalModel } from '@/features/histories/states/useHistoryPhotoviewModalModel'
import { Modal } from '@heroui/react'
import { HistoryPhotoviewCarousel } from './HistoryPhotoviewCarousel'

export const HistoryPhotoviewModal = () => {
  const { isOpen, currentHistoryId, onOpenChange } =
    useHistoryPhotoviewModalModel()

  if (!currentHistoryId) return

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Modal.Container size="lg" scroll="outside">
        <Modal.Dialog aria-label="History photo viewer" className="max-w-5xl">
          <Modal.CloseTrigger className="z-50" />
          <Modal.Body>
            <HistoryPhotoviewCarousel currentHistoryId={currentHistoryId} />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
