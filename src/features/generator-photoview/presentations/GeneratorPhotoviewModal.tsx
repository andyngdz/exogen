'use client'

import { useGeneratorPhotoviewModalModel } from '@/features/generator-photoview/states/useGeneratorPhotoviewModalModel'
import { Button, Modal } from '@heroui/react'
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
    <Modal.Backdrop
      isOpen={model.isOpen}
      onOpenChange={onOpenChange}
      variant="blur"
    >
      <Modal.Container size="full">
        <Modal.Dialog aria-label="Generator photo viewer">
          <Modal.Header className="flex flex-row items-center justify-between gap-4 pe-12">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <Modal.Heading className="text-sm">
                  Image {model.safeIndex + 1} of {model.total}
                </Modal.Heading>
                {model.seedLabel && (
                  <span className="text-xs text-muted tabular-nums">
                    Seed {model.seedLabel}
                  </span>
                )}
              </div>
              {model.prompt && (
                <span className="truncate text-sm text-muted">
                  {model.prompt}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="secondary"
                isPending={model.isUsingAsInput}
                onPress={() => void onUseAsInput()}
              >
                <ImageUp size={16} />
                Use as input
              </Button>
              <Button variant="secondary" onPress={model.onDownload}>
                <Download size={16} />
                Download
              </Button>
            </div>
          </Modal.Header>
          <Modal.CloseTrigger />
          <Modal.Body>
            <GeneratorPhotoviewCarousel initialIndex={model.safeIndex} />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
