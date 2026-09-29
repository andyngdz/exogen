'use client'

import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Label, Slider } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { GeneratorConfigHiresFixUpscaleFactor } from './GeneratorConfigHiresFixUpscaleFactor'
import { GeneratorConfigHiresFixUpscaler } from './GeneratorConfigHiresFixUpscaler'

export const GeneratorConfigHiresFix = () => {
  const { control } = useGeneratorConfigForm()

  return (
    <div className="flex flex-col gap-4">
      <GeneratorConfigHiresFixUpscaleFactor />
      <GeneratorConfigHiresFixUpscaler />
      <Controller
        name="hires_fix.denoising_strength"
        control={control}
        render={({ field }) => (
          <Slider
            step={0.05}
            minValue={0}
            maxValue={1}
            value={field.value}
            onChange={field.onChange}
            className="max-w-full"
          >
            <Label className="text-muted">Denoising Strength</Label>
            <Slider.Output className="text-muted" />
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>
        )}
      />
      <NumberInputController<GeneratorConfigFormValues>
        aria-label="Hires Steps"
        controlName="hires_fix.steps"
        minValue={0}
        maxValue={150}
        startContent={
          <span className="text-sm text-foreground min-w-fit">Hires Steps</span>
        }
        description="0 = use same as base steps"
      />
    </div>
  )
}
