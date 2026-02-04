'use client'

import { useBackendUrl } from '@/cores/backend-initialization'
import { useDownloadImages } from '@/features/generator-previewers/states'
import {
  useGeneratorModeStore,
  useImage2ImageConfigStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { GeneratorMode } from '@/types'
import {
  addToast,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent
} from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { Download, ImageUp } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useGeneratorPhotoviewStore } from '../states/useGeneratorPhotoviewStore'
import { GeneratorPhotoviewCarousel } from './GeneratorPhotoviewCarousel'

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Failed to read image'))
        return
      }
      resolve(result)
    }
    reader.readAsDataURL(blob)
  })
}

export const GeneratorPhotoviewModal = () => {
  const baseURL = useBackendUrl()
  const { isOpen, currentIndex, closePhotoview } = useGeneratorPhotoviewStore()
  const { items, imageStepEnds } = useUseImageGenerationStore()
  const { onDownloadImage } = useDownloadImages()
  const { setInitImageBase64 } = useImage2ImageConfigStore()
  const { setMode } = useGeneratorModeStore()
  const [isUsingAsInput, setIsUsingAsInput] = useState(false)

  const safeIndex = useMemo(() => {
    if (items.length === 0) return 0
    return Math.min(Math.max(0, currentIndex), items.length - 1)
  }, [currentIndex, items.length])

  const currentItem = items[safeIndex]
  const currentStepEnd = imageStepEnds[safeIndex]
  const currentBase64 = currentStepEnd?.image_base64 ?? ''

  const canDownload = !isEmpty(currentItem?.path)
  const canUseAsInput = !isEmpty(currentBase64) || !isEmpty(currentItem?.path)

  const onDownload = useCallback(() => {
    if (!currentItem || isEmpty(currentItem.path)) return
    onDownloadImage(`${baseURL}/${currentItem.path}`)
  }, [baseURL, currentItem, onDownloadImage])

  const onUseAsInput = useCallback(async () => {
    if (!currentItem) return

    setIsUsingAsInput(true)

    try {
      const dataUrl = await (async () => {
        // Prefer full-resolution file when available.
        if (!isEmpty(currentItem.path)) {
          try {
            const response = await fetch(`${baseURL}/${currentItem.path}`)
            if (!response.ok) {
              throw new Error('Failed to load image')
            }

            const blob = await response.blob()
            return blobToDataUrl(blob)
          } catch {
            if (!isEmpty(currentBase64)) {
              return `data:image/png;base64,${currentBase64}`
            }
            throw new Error('Failed to load image')
          }
        }

        if (!isEmpty(currentBase64)) {
          return `data:image/png;base64,${currentBase64}`
        }

        throw new Error('No image available')
      })()

      setInitImageBase64(dataUrl)
      setMode(GeneratorMode.IMAGE_2_IMAGE)
      closePhotoview()
    } catch (error: unknown) {
      addToast({
        title: 'Use as input',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to use image as input',
        color: 'danger'
      })
    } finally {
      setIsUsingAsInput(false)
    }
  }, [
    baseURL,
    closePhotoview,
    currentBase64,
    currentItem,
    setInitImageBase64,
    setMode
  ])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={closePhotoview}
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
            <GeneratorPhotoviewCarousel initialIndex={safeIndex} />
            <div className="absolute top-4 left-4 right-14 z-50 flex justify-end pointer-events-none">
              <ButtonGroup className="pointer-events-auto">
                <Button
                  startContent={<Download size={16} />}
                  variant="flat"
                  color="default"
                  isDisabled={!canDownload}
                  onPress={onDownload}
                  aria-label="Download current image"
                >
                  Download
                </Button>
                <Button
                  startContent={<ImageUp size={16} />}
                  variant="solid"
                  color="primary"
                  isDisabled={!canUseAsInput}
                  isLoading={isUsingAsInput}
                  onPress={onUseAsInput}
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
