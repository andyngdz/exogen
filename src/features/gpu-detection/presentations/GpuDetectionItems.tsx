'use client'

import { useGpuSelection } from '@/features/gpu-detection/states/useGpuSelection'
import { Card, RadioGroup } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { useMemo } from 'react'
import { GpuDetectionItem } from './GpuDetectionItem'

/** The GPU picker, shown when the machine has more than one. */
export const GpuDetectionItems = () => {
  const { gpus, selectedValue, onSelectedValueChange } = useGpuSelection()

  const items = useMemo(() => {
    // The array position is the backend device_index, so it identifies the GPU.
    return map(gpus, (gpu, deviceIndex) => {
      return (
        <GpuDetectionItem
          key={deviceIndex}
          gpu={gpu}
          value={`${deviceIndex}`}
        />
      )
    })
  }, [gpus])

  return (
    <Card>
      <RadioGroup
        aria-label="GPU"
        name="gpu"
        value={selectedValue}
        onChange={onSelectedValueChange}
      >
        {items}
      </RadioGroup>
    </Card>
  )
}
