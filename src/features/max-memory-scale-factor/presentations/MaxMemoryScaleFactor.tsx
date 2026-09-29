'use client'

import {
  MemoryScaleFactorItems,
  MemoryScaleFactorPreview
} from '@/cores/presentations/memory-scale-factor'
import { useMaxMemoryScaleFactorForm } from '@/features/max-memory-scale-factor/states/useMaxMemoryScaleFactorForm'
import { SetupLayout } from '@/features/setup-layout/presentations/SetupLayout'
import { Separator } from '@heroui/react'

export const MaxMemoryScaleFactor = () => {
  const {
    gpuScaleFactor,
    ramScaleFactor,
    onGpuChange,
    onRamChange,
    onNext,
    onBack
  } = useMaxMemoryScaleFactorForm()

  return (
    <SetupLayout
      title="Max Memory"
      description="Configure the maximum memory allocation for AI models"
      onNext={onNext}
      onBack={onBack}
    >
      <div className="flex flex-col items-center gap-8">
        <MemoryScaleFactorItems
          gpuScaleFactor={gpuScaleFactor}
          ramScaleFactor={ramScaleFactor}
          onGpuChange={onGpuChange}
          onRamChange={onRamChange}
        />
        <Separator />
        <MemoryScaleFactorPreview
          gpuScaleFactor={gpuScaleFactor}
          ramScaleFactor={ramScaleFactor}
        />
      </div>
    </SetupLayout>
  )
}
