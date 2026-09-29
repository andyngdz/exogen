'use client'

import {
  MEMORY_OPTIONS,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP
} from '@/features/max-memory-scale-factor/constants'
import { maxMemoryScaleFactorService } from '@/features/max-memory-scale-factor/services'
import { MemoryScaleFactorColor } from '@/features/max-memory-scale-factor/types'
import { sliderChangeService } from '@/services'
import { SliderChangeValue, ValueChanged } from '@/types'
import { Slider } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { FC } from 'react'

const FILL_CLASS_NAMES: Record<MemoryScaleFactorColor, string> = {
  [MemoryScaleFactorColor.SUCCESS]: 'bg-success',
  [MemoryScaleFactorColor.WARNING]: 'bg-warning',
  [MemoryScaleFactorColor.DANGER]: 'bg-danger'
}

export interface MemoryScaleFactorItemProps {
  fieldName: string
  label: string
  description: string
  value: number
  onChange: ValueChanged<number>
}

export const MemoryScaleFactorItem: FC<MemoryScaleFactorItemProps> = ({
  fieldName,
  label,
  description,
  value,
  onChange
}) => {
  const fillClassName =
    FILL_CLASS_NAMES[maxMemoryScaleFactorService.color(value)]

  const onSliderChange = (sliderValue: SliderChangeValue) => {
    onChange(sliderChangeService.toSingle(sliderValue))
  }

  return (
    <div
      className="flex w-full flex-col gap-4 rounded-2xl transition-colors"
      data-testid={`memory-slider-${fieldName}`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Slider
          aria-label={`${label} slider`}
          value={value}
          onChange={onSliderChange}
          onChangeEnd={onSliderChange}
          minValue={SLIDER_MIN}
          maxValue={SLIDER_MAX}
          step={SLIDER_STEP}
        >
          <Slider.Track>
            <Slider.Fill className={fillClassName} />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
        <div className="flex justify-between gap-2 text-xs text-muted">
          {map(MEMORY_OPTIONS, (memoryOption) => (
            <span key={memoryOption.scaleFactor}>{memoryOption.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
