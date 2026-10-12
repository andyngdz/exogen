'use client'

import { Button } from '@heroui/react'
import { Upload } from 'lucide-react'
import { useUploadLoraButton } from './useUploadLoraButton'

export const UploadLoraButton = () => {
  const { onUpload, isUploading } = useUploadLoraButton()

  return (
    <Button
      onPress={() => void onUpload()}
      isPending={isUploading}
      variant="primary"
      fullWidth
    >
      <Upload size={16} />
      Upload LoRA
    </Button>
  )
}
