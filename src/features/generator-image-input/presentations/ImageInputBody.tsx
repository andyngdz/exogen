'use client'

import { CardBody } from '@heroui/react'

interface ImageInputBodyProps {
  hasImage: boolean
  initImageBase64?: string
  lastError?: string
}

export const ImageInputBody = ({
  hasImage,
  initImageBase64,
  lastError
}: ImageInputBodyProps) => {
  return (
    <CardBody className="pt-0">
      {hasImage && initImageBase64 && (
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
      {lastError && (
        <div className="pb-3 text-xs text-red-500">{lastError}</div>
      )}
    </CardBody>
  )
}
