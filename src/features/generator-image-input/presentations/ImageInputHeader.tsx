'use client'

import { CardHeader, Spinner } from '@heroui/react'

interface ImageInputHeaderProps {
  dropzoneLabel: string
  isLoading: boolean
}

export const ImageInputHeader = ({
  dropzoneLabel,
  isLoading
}: ImageInputHeaderProps) => {
  return (
    <CardHeader className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-default-600">{dropzoneLabel}</span>
      <div className="flex items-center gap-2">
        {isLoading && <Spinner size="sm" />}
      </div>
    </CardHeader>
  )
}
