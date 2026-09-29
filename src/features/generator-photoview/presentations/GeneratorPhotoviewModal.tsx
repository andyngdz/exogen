'use client'

import { useGeneratorPhotoviewModalModel } from '@/features/generator-photoview/states/useGeneratorPhotoviewModalModel'
import { Button, ButtonGroup, Modal } from '@heroui/react'
import clsx from 'clsx'
import { Download, ImageUp } from 'lucide-react'
import { GeneratorPhotoviewCarousel } from './GeneratorPhotoviewCarousel'

export const GeneratorPhotoviewModal = () => {
  const model = useGeneratorPhotoviewModalModel()
  const { onUseAsInput } = model

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) return

    model.closePhotoview()
  }

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={model.isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
      >
        <Modal.Container size="lg" scroll="outside">
          <Modal.Dialog
            aria-label="Generator photo viewer"
            className="max-w-5xl"
          >
            <Modal.CloseTrigger className="z-50" />
            <Modal.Body>
              <div className="relative">
                <GeneratorPhotoviewCarousel initialIndex={model.safeIndex} />
                <div
                  className={clsx(
                    'absolute top-4 left-4 right-14 z-50',
                    'flex justify-end pointer-events-none'
                  )}
                >
                  <ButtonGroup className="pointer-events-auto">
                    <Button
                      variant="tertiary"
                      onPress={model.onDownload}
                      aria-label="Download current image"
                    >
                      <Download size={16} />
                      Download
                    </Button>
                    <Button
                      variant="primary"
                      isPending={model.isUsingAsInput}
                      onPress={() => void onUseAsInput()}
                      aria-label="Use current image as input"
                    >
                      <ImageUp size={16} />
                      Use as input
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
