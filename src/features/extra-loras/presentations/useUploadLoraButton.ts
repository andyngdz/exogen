'use client'

import { useUploadLoraMutation } from '@/cores/api-queries'
import { addToast } from '@heroui/react'
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

      addToast({
        title: 'LoRA uploaded',
        description: 'The LoRA model was uploaded successfully.',
        color: 'success'
      })
    } catch (error) {
      addToast({
        title: 'Upload failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to upload LoRA model.',
        color: 'danger'
      })
    }
  }, [uploadMutation])

  return {
    onUpload,
    isUploading: uploadMutation.isPending
  }
}
