'use client'

import { useHiresFixUpscalerSelect } from '@/features/generator-config-hires/states/useHiresFixUpscalerSelect'
import {
  Description,
  Header,
  Label,
  ListBox,
  Select,
  Separator
} from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { Fragment } from 'react'
import { GeneratorConfigHiresFixSelectLoader } from './GeneratorConfigHiresFixSelectLoader'

export const GeneratorConfigHiresFixUpscaler = () => {
  const { upscalers, upscaler, onUpscalerSelect } = useHiresFixUpscalerSelect()

  if (!upscaler) return <GeneratorConfigHiresFixSelectLoader />

  const lastSectionIndex = upscalers.length - 1

  return (
    <Select value={upscaler} onChange={onUpscalerSelect}>
      <Label>Upscaler</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {map(upscalers, (section, sectionIndex) => (
            <Fragment key={section.method}>
              <ListBox.Section>
                <Header>{section.title}</Header>
                {map(section.options, (option) => (
                  <ListBox.Item
                    key={option.value}
                    id={option.value}
                    textValue={option.name}
                  >
                    <Label>{option.name}</Label>
                    {option.is_recommended && (
                      <Description className="text-success">
                        Recommended
                      </Description>
                    )}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox.Section>
              {sectionIndex < lastSectionIndex && <Separator />}
            </Fragment>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
