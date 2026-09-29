'use client'

import {
  MemoryScaleFactorItems,
  MemoryScaleFactorPreview
} from '@/cores/presentations/memory-scale-factor'
import { useSettingsMemory } from '@/features/settings/states/useSettingsMemory'
import { Separator } from '@heroui/react'
import { SettingsBase } from './SettingsBase'

export const SettingsMemoryConfig = () => {
  const { gpu_scale_factor, ram_scale_factor, onGpuChange, onRamChange } =
    useSettingsMemory()

  return (
    <SettingsBase
      title="Memory Configuration"
      description="Adjust memory allocation for AI models"
    >
      <MemoryScaleFactorItems
        gpuScaleFactor={gpu_scale_factor}
        ramScaleFactor={ram_scale_factor}
        onGpuChange={onGpuChange}
        onRamChange={onRamChange}
      />
      <Separator />
      <MemoryScaleFactorPreview
        gpuScaleFactor={gpu_scale_factor}
        ramScaleFactor={ram_scale_factor}
      />
    </SettingsBase>
  )
}
