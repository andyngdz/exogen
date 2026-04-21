import { Button } from '@heroui/react'
import { FC } from 'react'

export interface GpuDetectionCpuModeOnlyProps {
  onCheckAgain: VoidFunction
}

export const GpuDetectionCpuModeOnly: FC<GpuDetectionCpuModeOnlyProps> = ({
  onCheckAgain
}) => {
  return (
    <div className="rounded-md">
      <div className="flex flex-col items-center justify-center gap-4">
        <h3 className="text-lg font-bold">CPU Mode Only</h3>
        <div className="text-center">
          ExoGen will run on CPU. This will be slower but still functional.
          Consider installing CUDA drivers for better performance.
        </div>
        <Button variant="bordered" color="primary" onPress={onCheckAgain}>
          {"I've installed CUDA drivers. Check again"}
        </Button>
      </div>
    </div>
  )
}
