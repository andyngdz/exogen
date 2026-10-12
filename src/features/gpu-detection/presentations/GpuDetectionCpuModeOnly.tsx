'use client'

import { useHardwareQuery } from '@/cores/api-queries'
import { Button } from '@heroui/react'

/** No CUDA GPU found: ExoGen runs on the CPU, and the hardware can be checked again. */
export const GpuDetectionCpuModeOnly = () => {
  const { refetch } = useHardwareQuery()
  const onCheckAgain = () => void refetch()

  return (
    <div className="rounded-md">
      <div className="flex flex-col items-center justify-center gap-4">
        <h3 className="text-lg font-bold">CPU Mode Only</h3>
        <div className="text-center">
          ExoGen will run on CPU. This will be slower but still functional.
          Consider installing CUDA drivers for better performance.
        </div>
        <Button
          variant="outline"
          className="text-accent"
          onPress={onCheckAgain}
        >
          {"I've installed CUDA drivers. Check again"}
        </Button>
      </div>
    </div>
  )
}
