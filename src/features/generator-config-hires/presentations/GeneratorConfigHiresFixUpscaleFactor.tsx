'use client'

import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Select, SelectItem, Skeleton } from '@heroui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { UPSCALE_FACTORS } from '../constants'

export const GeneratorConfigHiresFixUpscaleFactor = () => {
  const { control } = useFormContext<GeneratorConfigFormValues>()

  return (
    <Controller
      name="hires_fix.upscale_factor"
      control={control}
      render={({ field }) => {
        if (!field.value) {
          return <Skeleton className="h-14 rounded-medium" />
        }

        return (
          <Select
            label="Upscale Factor"
            selectedKeys={[field.value.toString()]}
            onSelectionChange={(keys) => {
              const selectedKey = keys.currentKey
              if (selectedKey) {
                field.onChange(Number(selectedKey))
              }
            }}
            aria-label="Upscale Factor"
            size="sm"
          >
            {UPSCALE_FACTORS.map((factor) => (
              <SelectItem key={factor.value.toString()}>
                {factor.label}
              </SelectItem>
            ))}
          </Select>
        )
      }}
    />
  )
}
