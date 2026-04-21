'use client'

import { useSamplersQuery } from '@/cores/api-queries'
import { SkeletonLoader } from '@/cores/presentations'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { Alert, Select, SelectItem } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { Controller, useFormContext } from 'react-hook-form'
import { GeneratorConfigSamplerDropdownLoader } from './GeneratorConfigSamplerDropdownLoader'

export const GeneratorConfigSamplerDropdown = () => {
  const { control } = useFormContext<GeneratorConfigFormValues>()
  const { data: samplers, isLoading, isError } = useSamplersQuery()

  if (isError) {
    return <Alert color="danger">Failed to load samplers</Alert>
  }

  if (samplers && isEmpty(samplers)) {
    return <Alert color="warning">No samplers available</Alert>
  }

  return (
    <SkeletonLoader
      isLoading={isLoading}
      data={samplers}
      skeleton={<GeneratorConfigSamplerDropdownLoader />}
    >
      {(samplers) => (
        <Controller
          name="sampler"
          control={control}
          render={({ field }) => (
            <Select
              selectedKeys={[field.value]}
              onSelectionChange={(keys) => {
                const selectedKey = keys.currentKey
                if (selectedKey) {
                  field.onChange(selectedKey)
                }
              }}
              aria-label="Sampler"
            >
              {samplers.map((sampler) => (
                <SelectItem
                  key={sampler.value}
                  description={sampler.description}
                >
                  {sampler.name}
                </SelectItem>
              ))}
            </Select>
          )}
        />
      )}
    </SkeletonLoader>
  )
}
