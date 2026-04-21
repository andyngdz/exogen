'use client'

import {
  MEMORY_OPTIONS,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP
} from '@/features/max-memory-scale-factor/constants'
import { maxMemoryScaleFactorService } from '@/features/max-memory-scale-factor/services'
import { Slider, SliderValue } from '@heroui/react'
import { FC, useMemo } from 'react'

export interface MemoryScaleFactorItemProps {
  fieldName: string
  label: string
  description: string
  value: number
  onChange: (value: SliderValue) => void
}

export const MemoryScaleFactorItem: FC<MemoryScaleFactorItemProps> = ({
  fieldName,
  label,
  description,
  value,
  onChange
}) => {
  const SLIDER_MARKS = useMemo(
    () =>
      MEMORY_OPTIONS.map((m) => ({
        value: m.scaleFactor,
        label: m.label
      })),
    []
  )
  const color = maxMemoryScaleFactorService.color(value)

  return (
    <div
      className="w-full rounded-2xl transition-colors"
      data-testid={`memory-slider-${fieldName}`}
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-default-500">{description}</p>
        </div>
      </div>
      <Slider
        aria-label={`${label} slider`}
        value={value}
        onChange={onChange}
        onChangeEnd={onChange}
        minValue={SLIDER_MIN}
        maxValue={SLIDER_MAX}
        step={SLIDER_STEP}
        marks={SLIDER_MARKS}
        color={color}
        hideValue
        classNames={{
          base: 'mt-4',
          value: 'hidden'
        }}
        showSteps
      />
    </div>
  )
}
