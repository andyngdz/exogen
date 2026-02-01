'use client'

import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { GeneratorConfigHiresFix } from '@/features/generator-config-hires/presentations/GeneratorConfigHiresFix'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Checkbox } from '@heroui/react'
import { useFormContext } from 'react-hook-form'
import { useGeneratorConfigFormats } from '../states'

export const GeneratorConfigFormat = () => {
  const { control } = useFormContext<GeneratorConfigFormValues>()
  const { isHiresFixEnabled, onHiresFixToggle } = useGeneratorConfigFormats()

  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Format</span>
      <div className="flex gap-4">
        <NumberInputController
          aria-label="Width"
          control={control}
          controlName="width"
          minValue={64}
          startContent={<span className="text-sm text-default-700">W</span>}
        />
        <NumberInputController
          aria-label="Height"
          control={control}
          controlName="height"
          minValue={64}
          startContent={<span className="text-sm text-default-700">H</span>}
        />
      </div>
      <Checkbox
        isSelected={isHiresFixEnabled}
        onValueChange={onHiresFixToggle}
        classNames={{
          label: 'text-sm'
        }}
      >
        Hires.fix
      </Checkbox>
      {isHiresFixEnabled && <GeneratorConfigHiresFix />}
    </div>
  )
}
