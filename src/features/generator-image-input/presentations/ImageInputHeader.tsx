'use client'

import { Button, CardHeader, Spinner } from '@heroui/react'

interface ImageInputHeaderProps {
  dropzoneLabel: string
  isLoading: boolean
  hasImage: boolean
  onRemove: () => void
}

export const ImageInputHeader = ({
  dropzoneLabel,
  isLoading,
  hasImage,
  onRemove
}: ImageInputHeaderProps) => {
  return (
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
              onPress={onRemove}
              isDisabled={isLoading}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  )
}
