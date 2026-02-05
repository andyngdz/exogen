'use client'

import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent
} from '@heroui/react'
import { Download, ImageUp } from 'lucide-react'
import { useGeneratorPhotoviewModalModel } from '../states/useGeneratorPhotoviewModalModel'
import { GeneratorPhotoviewCarousel } from './GeneratorPhotoviewCarousel'

export const GeneratorPhotoviewModal = () => {
  const model = useGeneratorPhotoviewModalModel()

  if (!model.isOpen) return null

  return (
    <Modal
      isOpen={model.isOpen}
      onClose={model.closePhotoview}
      size="5xl"
      backdrop="blur"
      scrollBehavior="outside"
      aria-label="Generator photo viewer"
      classNames={{
        body: 'p-0',
        closeButton: 'z-50'
      }}
    >
      <ModalContent>
        <ModalBody>
          <div className="relative">
            <GeneratorPhotoviewCarousel initialIndex={model.safeIndex} />
            <div className="absolute top-4 left-4 right-14 z-50 flex justify-end pointer-events-none">
              <ButtonGroup className="pointer-events-auto">
                <Button
                  startContent={<Download size={16} />}
                  variant="flat"
                  color="default"
                  isDisabled={!model.canDownload}
                  onPress={model.onDownload}
                  aria-label="Download current image"
                >
                  Download
                </Button>
                <Button
                  startContent={<ImageUp size={16} />}
                  variant="solid"
                  color="primary"
                  isDisabled={!model.canUseAsInput}
                  isLoading={model.isUsingAsInput}
                  onPress={model.onUseAsInput}
                  aria-label="Use current image as input"
                >
                  Use as input
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
