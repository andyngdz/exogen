'use client'

import { Card, Separator } from '@heroui/react'
import { FC } from 'react'

export interface GpuDetectionVersionProps {
  cuda_runtime_version: string
  nvidia_driver_version: string
}

export const GpuDetectionVersion: FC<GpuDetectionVersionProps> = ({
  cuda_runtime_version,
  nvidia_driver_version
}) => {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-foreground">Cuda version</span>
          <span className="text-sm font-bold">{cuda_runtime_version}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-foreground">Driver version</span>
          <span className="text-sm font-bold">{nvidia_driver_version}</span>
        </div>
      </div>
    </Card>
  )
}
