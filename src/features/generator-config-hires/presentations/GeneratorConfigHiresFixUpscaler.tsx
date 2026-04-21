'use client'

import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Select, SelectItem, SelectSection, Skeleton } from '@heroui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useGeneratorConfigHiresFixUpscaler } from '../states'

export const GeneratorConfigHiresFixUpscaler = () => {
  const { control } = useFormContext<GeneratorConfigFormValues>()
  const { upscalers, onUpscalerChange } = useGeneratorConfigHiresFixUpscaler()

  return (
    <Controller
      name="hires_fix.upscaler"
      control={control}
      render={({ field }) => {
        if (!field.value) {
          return <Skeleton className="h-14 rounded-medium" />
        }

        return (
          <Select
            label="Upscaler"
            selectedKeys={[field.value]}
            onSelectionChange={(keys) => {
              const selectedKey = keys.currentKey
              if (selectedKey) {
                field.onChange(selectedKey)
                onUpscalerChange(selectedKey)
              }
            }}
            aria-label="Upscaler"
            size="sm"
          >
            {upscalers.map((section, index) => (
              <SelectSection
                key={section.method}
                title={section.title}
                showDivider={index < upscalers.length - 1}
              >
                {section.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    description={
                      option.is_recommended && (
                        <span className="text-xs text-success">
                          Recommended
                        </span>
                      )
                    }
                  >
                    {option.name}
                  </SelectItem>
                ))}
              </SelectSection>
            ))}
          </Select>
        )
      }}
    />
  )
}
