'use client'

import { UPSCALE_FACTORS } from '@/features/generator-config-hires/constants'
import { useHiresFixUpscaleFactor } from '@/features/generator-config-hires/states/useHiresFixUpscaleFactor'
import { Label, ListBox, Select } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { GeneratorConfigHiresFixSelectLoader } from './GeneratorConfigHiresFixSelectLoader'

export const GeneratorConfigHiresFixUpscaleFactor = () => {
  const { upscaleFactor, onUpscaleFactorChange } = useHiresFixUpscaleFactor()

  if (!upscaleFactor) return <GeneratorConfigHiresFixSelectLoader />

  return (
    <Select value={`${upscaleFactor}`} onChange={onUpscaleFactorChange}>
      <Label>Upscale Factor</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {map(UPSCALE_FACTORS, (factor) => (
            <ListBox.Item
              key={factor.value}
              id={`${factor.value}`}
              textValue={factor.label}
            >
              {factor.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
