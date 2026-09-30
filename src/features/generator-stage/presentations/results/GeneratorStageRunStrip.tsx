import { ImageGenerationStepEndResponse, ValueChanged } from '@/types'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { map } from 'es-toolkit/compat'
import { FC } from 'react'
import { GeneratorStageImage } from './GeneratorStageImage'

interface GeneratorStageRunStripProps {
  imageStepEnds: ImageGenerationStepEndResponse[]
  selectedIndex: number
  onSelect: ValueChanged<number>
}

export const GeneratorStageRunStrip: FC<GeneratorStageRunStripProps> = ({
  imageStepEnds,
  selectedIndex,
  onSelect
}) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">This run</span>
      <div className="flex gap-2">
        {map(imageStepEnds, (imageStepEnd) => {
          const isSelected = imageStepEnd.index === selectedIndex

          return (
            <Button
              key={imageStepEnd.index}
              isIconOnly
              variant="ghost"
              aria-label={`Show image ${imageStepEnd.index + 1}`}
              aria-current={isSelected}
              onPress={() => onSelect(imageStepEnd.index)}
              className={clsx(
                'relative size-12 overflow-hidden rounded-lg',
                'bg-surface p-0',
                { 'ring-2 ring-accent': isSelected }
              )}
            >
              <GeneratorStageImage imageStepEnd={imageStepEnd} />
            </Button>
          )
        })}
      </div>
    </div>
  )
}
