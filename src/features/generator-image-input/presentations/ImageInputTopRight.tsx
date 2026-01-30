'use client'

import { Button } from '@heroui/react'
import { Trash2 } from 'lucide-react'

interface ImageInputTopRightProps {
  isLoading: boolean
  onRemove: VoidFunction
}

export const ImageInputTopRight = ({
  isLoading,
  onRemove
}: ImageInputTopRightProps) => {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        aria-label="Remove input image"
        isDisabled={isLoading}
        onPress={onRemove}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  )
}
