'use client'

import { Card, Spinner } from '@heroui/react'

interface ImageInputHeaderProps {
  dropzoneLabel: string
  isLoading: boolean
}

export const ImageInputHeader = ({
  dropzoneLabel,
  isLoading
}: ImageInputHeaderProps) => {
  return (
    <Card.Header className="flex flex-row items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted">{dropzoneLabel}</span>
      <div className="flex items-center gap-2">
        {isLoading && <Spinner size="sm" />}
      </div>
    </Card.Header>
  )
}
