'use client'

import { ValueChanged } from '@/types'
import { FC } from 'react'
import { MemoryScaleFactorItem } from './MemoryScaleFactorItem'

export interface MemoryScaleFactorItemsProps {
  gpuScaleFactor: number
  ramScaleFactor: number
  onGpuChange: ValueChanged<number>
  onRamChange: ValueChanged<number>
}

export const MemoryScaleFactorItems: FC<MemoryScaleFactorItemsProps> = ({
  gpuScaleFactor,
  ramScaleFactor,
  onGpuChange,
  onRamChange
}) => (
  <div
    className="flex w-full flex-col gap-6"
    data-testid="memory-scale-factor-sliders"
  >
    <MemoryScaleFactorItem
      fieldName="gpuScaleFactor"
      label="GPU allocation"
      description="Limit how much VRAM the pipeline can consume."
      value={gpuScaleFactor}
      onChange={onGpuChange}
    />
    <MemoryScaleFactorItem
      fieldName="ramScaleFactor"
      label="RAM allocation"
      description="Limit how much system RAM background tasks may use."
      value={ramScaleFactor}
      onChange={onRamChange}
    />
  </div>
)
