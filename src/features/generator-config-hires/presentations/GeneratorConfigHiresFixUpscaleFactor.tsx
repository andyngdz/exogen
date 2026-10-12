'use client'

import { UPSCALE_FACTORS } from '@/features/generator-config-hires/constants'
import { useHiresFixUpscaleFactor } from '@/features/generator-config-hires/states/useHiresFixUpscaleFactor'
import { Label, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { GeneratorConfigHiresFixSelectLoader } from './GeneratorConfigHiresFixSelectLoader'

export const GeneratorConfigHiresFixUpscaleFactor = () => {
  const { upscaleFactor, onUpscaleFactorChange } = useHiresFixUpscaleFactor()

  if (!upscaleFactor) return <GeneratorConfigHiresFixSelectLoader />

  return (
    <div className="flex flex-col gap-2">
      <Label>Upscale factor</Label>
      <ToggleButtonGroup
        aria-label="Upscale factor"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[`${upscaleFactor}`]}
        onSelectionChange={onUpscaleFactorChange}
        size="sm"
        fullWidth
      >
        {map(UPSCALE_FACTORS, (factor) => (
          <ToggleButton key={factor.value} id={`${factor.value}`}>
            {factor.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  )
}
