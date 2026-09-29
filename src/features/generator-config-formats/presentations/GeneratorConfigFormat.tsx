'use client'

import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { useGeneratorConfigFormats } from '@/features/generator-config-formats/states'
import { GeneratorConfigHiresFix } from '@/features/generator-config-hires/presentations/GeneratorConfigHiresFix'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Checkbox } from '@heroui/react'

export const GeneratorConfigFormat = () => {
  const { isHiresFixEnabled, onHiresFixToggle } = useGeneratorConfigFormats()

  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Format</span>
      <div className="flex gap-4">
        <NumberInputController<GeneratorConfigFormValues>
          aria-label="Width"
          controlName="width"
          minValue={64}
          startContent={<span className="text-sm text-foreground">W</span>}
        />
        <NumberInputController<GeneratorConfigFormValues>
          aria-label="Height"
          controlName="height"
          minValue={64}
          startContent={<span className="text-sm text-foreground">H</span>}
        />
      </div>
      <Checkbox isSelected={isHiresFixEnabled} onChange={onHiresFixToggle}>
        <Checkbox.Content className="text-sm">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          Hires.fix
        </Checkbox.Content>
      </Checkbox>
      {isHiresFixEnabled && <GeneratorConfigHiresFix />}
    </div>
  )
}
