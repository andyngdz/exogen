'use client'

import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Slider } from '@heroui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { GeneratorConfigHiresFixUpscaleFactor } from './GeneratorConfigHiresFixUpscaleFactor'
import { GeneratorConfigHiresFixUpscaler } from './GeneratorConfigHiresFixUpscaler'

export const GeneratorConfigHiresFix = () => {
  const { control } = useFormContext<GeneratorConfigFormValues>()

  return (
    <div className="flex flex-col gap-4">
      <GeneratorConfigHiresFixUpscaleFactor />
      <GeneratorConfigHiresFixUpscaler />
      <Controller
        name="hires_fix.denoising_strength"
        control={control}
        render={({ field }) => (
          <Slider
            label="Denoising Strength"
            size="sm"
            step={0.05}
            minValue={0}
            maxValue={1}
            value={field.value}
            onChange={(value) => field.onChange(value)}
            className="max-w-full"
            classNames={{
              label: 'text-default-500',
              value: 'text-default-500'
            }}
          />
        )}
      />
      <NumberInputController
        aria-label="Hires Steps"
        control={control}
        controlName="hires_fix.steps"
        minValue={0}
        maxValue={150}
        startContent={
          <span className="text-sm text-default-700 min-w-fit">
            Hires Steps
          </span>
        }
        description="0 = use same as base steps"
      />
    </div>
  )
}
