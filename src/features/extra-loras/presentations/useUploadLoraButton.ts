'use client'

import { useUploadLoraMutation } from '@/cores/api-queries'
import { toast } from '@heroui/react'
import { useCallback } from 'react'

export const useUploadLoraButton = () => {
  const uploadMutation = useUploadLoraMutation()

  const onUpload = useCallback(async () => {
    try {
      const filePath = await globalThis.window.electronAPI.selectFile([
        {
          name: 'LoRA Models',
          extensions: ['safetensors', 'ckpt', 'pt', 'bin', 'pth']
        }
      ])

      if (!filePath) {
        return
      }

      await uploadMutation.mutateAsync(filePath)

      toast.success('LoRA uploaded', {
        description: 'The LoRA model was uploaded successfully.'
      })
    } catch (error) {
      toast.danger('Upload failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to upload LoRA model.'
      })
    }
  }, [uploadMutation])

  return {
    onUpload,
    isUploading: uploadMutation.isPending
  }
}
