'use client'

import { SkeletonLoader } from '@/cores/presentations'
import { useGeneratorConfigSamplerDropdown } from '@/features/generator-config-sampling/states/useGeneratorConfigSamplerDropdown'
import { Alert, Description, Label, ListBox, Select } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { GeneratorConfigSamplerDropdownLoader } from './GeneratorConfigSamplerDropdownLoader'

export const GeneratorConfigSamplerDropdown = () => {
  const {
    samplers,
    isLoading,
    isError,
    isEmptySamplers,
    sampler,
    onSamplerChange
  } = useGeneratorConfigSamplerDropdown()

  if (isError) {
    return (
      <Alert status="danger">
        <Alert.Title>Failed to load samplers</Alert.Title>
      </Alert>
    )
  }

  if (isEmptySamplers) {
    return (
      <Alert status="warning">
        <Alert.Title>No samplers available</Alert.Title>
      </Alert>
    )
  }

  return (
    <SkeletonLoader
      isLoading={isLoading}
      data={samplers}
      skeleton={<GeneratorConfigSamplerDropdownLoader />}
    >
      {(loadedSamplers) => (
        <Select value={sampler} onChange={onSamplerChange} aria-label="Sampler">
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {map(loadedSamplers, (samplerOption) => (
                <ListBox.Item
                  key={samplerOption.value}
                  id={samplerOption.value}
                  textValue={samplerOption.name}
                >
                  <div className="flex flex-col gap-1">
                    <Label>{samplerOption.name}</Label>
                    <Description>{samplerOption.description}</Description>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      )}
    </SkeletonLoader>
  )
}
