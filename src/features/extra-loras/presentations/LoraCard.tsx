import { useLoraCard } from '@/features/extra-loras/states'
import { sliderChangeService } from '@/services'
import type { LoRA } from '@/types'
import { Button, Card, Label, Slider } from '@heroui/react'
import { X } from 'lucide-react'
import { FC } from 'react'

interface LoraCardProps {
  lora: LoRA
  onRemove: VoidFunction
}

export const LoraCard: FC<LoraCardProps> = ({ lora, onRemove }) => {
  const { weight, setWeight } = useLoraCard(lora.id)

  return (
    <Card>
      <Card.Header className="flex flex-row items-center justify-between gap-2">
        <span className="font-semibold text-sm">{lora.name}</span>
        <Button
          size="sm"
          variant="ghost"
          onPress={onRemove}
          aria-label={`Remove ${lora.name}`}
          isIconOnly
        >
          <X size={16} />
        </Button>
      </Card.Header>

      <Card.Content>
        <Slider
          step={0.05}
          minValue={0}
          maxValue={2}
          value={weight}
          onChange={(value) => setWeight(sliderChangeService.toSingle(value))}
          className="max-w-full"
        >
          <Label className="text-muted">Weight</Label>
          <Slider.Output className="text-muted" />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </Card.Content>
    </Card>
  )
}
