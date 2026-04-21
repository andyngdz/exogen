'use client'

import { useMaxMemoryMutation } from '@/cores/api-queries'
import { useConfig } from '@/cores/hooks'
import { SliderValue } from '@heroui/react'
import { useCallback } from 'react'

export const useSettingsMemory = () => {
  const { gpu_scale_factor, ram_scale_factor } = useConfig()
  const { mutate: setMaxMemory } = useMaxMemoryMutation()

  const onGpuChange = useCallback(
    (value: SliderValue) => {
      const numericValue = Number(value)

      setMaxMemory({
        gpuScaleFactor: numericValue,
        ramScaleFactor: ram_scale_factor
      })
    },
    [ram_scale_factor, setMaxMemory]
  )

  const onRamChange = useCallback(
    (value: SliderValue) => {
      const numericValue = Number(value)

      setMaxMemory({
        gpuScaleFactor: gpu_scale_factor,
        ramScaleFactor: numericValue
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
