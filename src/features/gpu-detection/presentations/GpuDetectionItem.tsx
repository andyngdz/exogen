'use client'

import { formatter } from '@/services'
import { GpuInfo } from '@/types'
import { Description, Radio, RadioProps } from '@heroui/react'
import { FC } from 'react'

export interface GpuDetectionItemProps extends RadioProps {
  gpu: GpuInfo
}

export const GpuDetectionItem: FC<GpuDetectionItemProps> = ({
  gpu,
  ...restProps
}) => {
  const { name, cuda_compute_capability, memory } = gpu

  return (
    <Radio {...restProps}>
      <Radio.Content className="flex w-full items-center gap-2">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-bold">{name}</span>
          <span className="text-sm text-foreground font-medium">
            {formatter.bytes(memory)}
          </span>
        </div>
      </Radio.Content>
      <Description>
        Cuda compute capability{' '}
        <span className="font-bold">{cuda_compute_capability}</span>
      </Description>
    </Radio>
  )
}
