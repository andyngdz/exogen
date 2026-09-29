import { useGpuSelection } from '@/features/gpu-detection/states/useGpuSelection'
import { GpuInfo } from '@/types'
import { Card, RadioGroup } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { FC, useMemo } from 'react'
import { GpuDetectionItem } from './GpuDetectionItem'

export interface GpuDetectionItemsProps {
  gpus: GpuInfo[]
}

export const GpuDetectionItems: FC<GpuDetectionItemsProps> = ({ gpus }) => {
  const { selectedValue, onSelectedValueChange } = useGpuSelection(gpus)

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
