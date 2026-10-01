import { ModelRecommendationItem } from '@/types/api'
import { Chip, Radio } from '@heroui/react'
import clsx from 'clsx'
import { Gpu, HardDrive } from 'lucide-react'
import { FC } from 'react'
import { ModelRecommendationsTags } from './ModelRecommendationsTags'

interface ModelStepCardProps {
  model: ModelRecommendationItem
}

/** One recommended model to pick: name, size on disk, VRAM it needs, what it is good at. */
export const ModelStepCard: FC<ModelStepCardProps> = ({ model }) => {
  return (
    <Radio
      value={model.id}
      className={clsx(
        'min-w-80 flex-1 items-stretch justify-start',
        'rounded-2xl bg-surface p-4',
        'data-[selected=true]:ring-1 data-[selected=true]:ring-accent'
      )}
    >
      <Radio.Content
        className={clsx(
          'flex w-full flex-1 flex-col',
          'items-stretch gap-2 text-left'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <span className="font-semibold">{model.name}</span>
            {model.is_recommended && (
              <Chip size="sm" color="accent" variant="soft">
                Recommended
              </Chip>
            )}
          </span>
          <span className="flex items-center gap-4 font-mono text-xs text-muted">
            <span className="flex items-center gap-1">
              <HardDrive size={12} />
              {model.model_size}
            </span>
            <span className="flex items-center gap-1">
              <Gpu size={12} />
              {model.memory_requirement_gb} GB
            </span>
          </span>
        </div>
        <p className="text-sm text-muted">{model.description}</p>
        <ModelRecommendationsTags tags={model.tags} />
      </Radio.Content>
    </Radio>
  )
}
