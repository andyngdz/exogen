import { hardwareStepService } from '@/features/gpu-detection/services/hardware-step'
import { GpuInfo, HardwareResponse } from '@/types'
import { Card, Chip } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { Check, Cpu } from 'lucide-react'
import { FC } from 'react'
import { GpuDetectionItems } from './GpuDetectionItems'

interface HardwareGpuCardProps {
  hardware: HardwareResponse
  gpu: GpuInfo
  hasManyGpus: boolean
}

/** The GPU ExoGen will use, with its CUDA facts; a picker when there is more than one. */
export const HardwareGpuCard: FC<HardwareGpuCardProps> = ({
  hardware,
  gpu,
  hasManyGpus
}) => {
  return (
    <Card>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-semibold">
            <Cpu size={20} className="text-accent" />
            {gpu.name}
          </span>
          <Chip size="sm" color="success" variant="soft">
            <Check size={12} />
            CUDA ready
          </Chip>
        </div>
        {hasManyGpus && <GpuDetectionItems gpus={hardware.gpus} />}
        <div className="flex flex-wrap gap-2">
          {map(hardwareStepService.toSpecs(hardware, gpu), (spec) => (
            <Card
              key={spec.label}
              variant="secondary"
              className="min-w-32 flex-1"
            >
              <Card.Content className="flex flex-col gap-1">
                <span className="text-xs text-muted">{spec.label}</span>
                <span className="font-mono text-sm">{spec.value}</span>
              </Card.Content>
            </Card>
          ))}
        </div>
      </Card.Content>
    </Card>
  )
}
