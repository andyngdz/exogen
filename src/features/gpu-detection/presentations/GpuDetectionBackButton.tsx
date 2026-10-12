'use client'

import { useGpuDetectionBack } from '@/features/gpu-detection/states/useGpuDetectionBack'
import { Button } from '@heroui/react'
import { ChevronLeft } from 'lucide-react'

/** Back to the Backend step. */
export const GpuDetectionBackButton = () => {
  const { onBack } = useGpuDetectionBack()

  return (
    <Button variant="ghost" onPress={onBack}>
      <ChevronLeft size={16} />
      Back
    </Button>
  )
}
