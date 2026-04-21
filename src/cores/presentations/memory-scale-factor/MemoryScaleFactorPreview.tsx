'use client'

import { useConfig } from '@/cores/hooks'
import { formatter } from '@/services'
import { FC } from 'react'

export interface MemoryScaleFactorPreviewProps {
  gpuScaleFactor: number
  ramScaleFactor: number
}

export const MemoryScaleFactorPreview: FC<MemoryScaleFactorPreviewProps> = ({
  gpuScaleFactor,
  ramScaleFactor
}) => {
  const { total_gpu_memory, total_ram_memory } = useConfig()

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-center text-default-500">Memory Usage Preview</div>
      <div className="flex gap-2">
        <div className="font-bold">
          GPU: {formatter.bytes(total_gpu_memory * gpuScaleFactor)}
        </div>
        <div>/</div>
        <div className="font-bold">
          RAM: {formatter.bytes(total_ram_memory * ramScaleFactor)}
        </div>
      </div>
    </div>
  )
}
