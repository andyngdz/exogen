'use client'

import {
  MemoryScaleFactorItems,
  MemoryScaleFactorPreview
} from '@/cores/shared/memory-scale-factor'
import { useGpuDetectionMemory } from '@/features/gpu-detection/states/useGpuDetectionMemory'
import { Card } from '@heroui/react'

/** The Max memory card: the GPU and RAM limits with a preview of what they allow. */
export const GpuDetectionMemory = () => {
  const { gpuScaleFactor, ramScaleFactor, onGpuChange, onRamChange } =
    useGpuDetectionMemory()

  return (
    <Card>
      <Card.Content className="flex flex-col gap-4">
        <h2 className="font-semibold">Max memory</h2>
        <MemoryScaleFactorItems
          gpuScaleFactor={gpuScaleFactor}
          ramScaleFactor={ramScaleFactor}
          onGpuChange={onGpuChange}
          onRamChange={onRamChange}
        />
        <MemoryScaleFactorPreview
          gpuScaleFactor={gpuScaleFactor}
          ramScaleFactor={ramScaleFactor}
        />
      </Card.Content>
    </Card>
  )
}
