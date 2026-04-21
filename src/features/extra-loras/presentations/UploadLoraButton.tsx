'use client'

import { Button } from '@heroui/react'
import { Upload } from 'lucide-react'
import { useUploadLoraButton } from './useUploadLoraButton'

export const UploadLoraButton = () => {
  const { onUpload, isUploading } = useUploadLoraButton()

  return (
    <Button
      onPress={onUpload}
      startContent={<Upload size={16} />}
      isLoading={isUploading}
      color="primary"
    >
      Upload LoRA
    </Button>
  )
}
