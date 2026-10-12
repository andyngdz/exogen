'use client'

import { useUploadLoraMutation } from '@/cores/api-queries'
import { apiErrorService } from '@/services/errors'
import { toast } from '@heroui/react'
import { useCallback } from 'react'

const LORA_FILE_FILTERS = [
  {
    name: 'LoRA Models',
    extensions: ['safetensors', 'ckpt', 'pt', 'bin', 'pth']
  }
]

export const useUploadLoraButton = () => {
  const uploadMutation = useUploadLoraMutation()

  const onUpload = useCallback(async () => {
    const filePath = await globalThis.window.electronAPI
      .selectFile(LORA_FILE_FILTERS)
      .catch((error: unknown) => {
        toast.danger('Upload failed', {
          description: apiErrorService.toMessage(
            error,
            'The file picker did not open. Try again.'
          )
        })
      })

    if (!filePath) return

    // The mutation shows its own error toast.
    uploadMutation.mutate(filePath, {
      onSuccess: () => {
        toast.success('LoRA uploaded', {
          description: 'The LoRA model was uploaded successfully.'
        })
      }
    })
  }, [uploadMutation])

  return {
    onUpload,
    isUploading: uploadMutation.isPending
  }
}
