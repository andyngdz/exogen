'use client'

import { useImage2ImageConfigStore } from '@/features/generators'
import { Button, Card, CardBody, CardHeader, Spinner } from '@heroui/react'
import clsx from 'clsx'
import { useMemo, useRef } from 'react'
import { useImageInput } from '../states'

export const ImageInput = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { initImageBase64, setInitImageBase64, clearInitImageBase64 } =
    useImage2ImageConfigStore()

  const hasImage = !!initImageBase64

  const {
    isDragActive,
    isLoading,
    onFileChange,
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave
  } = useImageInput({
    onImageDataUrl: setInitImageBase64
  })

  const dropzoneLabel = useMemo(() => {
    if (hasImage) return 'Input image'
    return 'Drop an image here, paste, or upload'
  }, [hasImage])

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <Card
        as="div"
        shadow="none"
        isPressable
        className={clsx(
          'relative w-full overflow-hidden border border-default-200 bg-content2',
          {
            'border-primary bg-primary-50': isDragActive
          }
        )}
        onPress={() => {
          if (isLoading) return
          fileInputRef.current?.click()
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <CardHeader className="flex items-center justify-between gap-4 py-3">
          <span className="text-sm text-default-600">{dropzoneLabel}</span>
          <div className="flex items-center gap-2">
            {isLoading && <Spinner size="sm" />}
            {hasImage && (
              <div
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                <Button
                  size="sm"
                  variant="flat"
                  onPress={clearInitImageBase64}
                  isDisabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardBody className="pt-0">
          {hasImage && (
            <img
              src={initImageBase64}
              alt="Input"
              className="max-h-48 w-full rounded-medium object-contain bg-black/5"
            />
          )}
          {!hasImage && (
            <div className="pb-3 text-xs text-default-500">
              Tip: you can paste from clipboard (Ctrl/Cmd+V)
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
