'use client'

import { useMaxMemoryMutation } from '@/cores/api-queries'
import { useConfig } from '@/cores/hooks'
import { useCallback } from 'react'

export const useSettingsMemory = () => {
  const { gpu_scale_factor, ram_scale_factor } = useConfig()
  const { mutate: setMaxMemory } = useMaxMemoryMutation()

  const onGpuChange = useCallback(
    (gpuScaleFactor: number) => {
      setMaxMemory({
        gpuScaleFactor,
        ramScaleFactor: ram_scale_factor
      })
    },
    [ram_scale_factor, setMaxMemory]
  )

  const onRamChange = useCallback(
    (ramScaleFactor: number) => {
      setMaxMemory({
        gpuScaleFactor: gpu_scale_factor,
        ramScaleFactor
      })
    },
    [gpu_scale_factor, setMaxMemory]
  )

  return {
    gpu_scale_factor,
    ram_scale_factor,
    onGpuChange,
    onRamChange
  }
}
