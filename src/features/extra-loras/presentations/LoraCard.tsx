import type { LoRA } from '@/types'
import { Button, Card, CardBody, CardHeader, Slider } from '@heroui/react'
import { X } from 'lucide-react'
import { FC } from 'react'
import { useLoraCard } from '../states'

interface LoraCardProps {
  lora: LoRA
  onRemove: VoidFunction
}

export const LoraCard: FC<LoraCardProps> = ({ lora, onRemove }) => {
  const { weight, setWeight } = useLoraCard(lora.id)

  return (
    <Card shadow="sm">
      <CardHeader className="flex justify-between items-center pb-0">
        <span className="font-semibold text-sm">{lora.name}</span>
        <Button
          size="sm"
          variant="light"
          radius="full"
          onPress={onRemove}
          isIconOnly
        >
          <X size={16} />
        </Button>
      </CardHeader>

      <CardBody>
        <Slider
          size="sm"
          step={0.05}
          minValue={0}
          maxValue={2}
          value={weight}
          onChange={(value) => setWeight(value as number)}
          label="Weight"
          className="max-w-full"
          classNames={{
            label: 'text-default-500',
            value: 'text-default-500'
          }}
        />
      </CardBody>
    </Card>
  )
}
