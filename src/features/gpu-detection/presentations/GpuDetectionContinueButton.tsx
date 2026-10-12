'use client'

import { useGpuDetectionContinue } from '@/features/gpu-detection/states/useGpuDetectionContinue'
import { Button } from '@heroui/react'
import { ArrowRight } from 'lucide-react'

/** Continue, once a GPU is picked: saves the GPU and the memory limits. */
export const GpuDetectionContinueButton = () => {
  const { isContinueDisabled, onContinue } = useGpuDetectionContinue()

  return (
    <Button
      variant="primary"
      isDisabled={isContinueDisabled}
      onPress={onContinue}
    >
      Continue
      <ArrowRight size={16} />
    </Button>
  )
}
