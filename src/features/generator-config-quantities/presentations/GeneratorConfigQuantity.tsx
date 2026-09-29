import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Tooltip } from '@heroui/react'
import { Info } from 'lucide-react'

export const GeneratorConfigQuantity = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Quantity</span>
      <div className="flex gap-4">
        <NumberInputController<GeneratorConfigFormValues>
          aria-label="Number of images"
          controlName="number_of_images"
          minValue={1}
          startContent={
            <span className="text-sm text-foreground min-w-fit">Images</span>
          }
          endContent={
            <Tooltip delay={0}>
              <Tooltip.Trigger aria-label="About number of images">
                <Info size={16} className="text-foreground" />
              </Tooltip.Trigger>
              <Tooltip.Content>
                Number of images will be generated
              </Tooltip.Content>
            </Tooltip>
          }
        />
      </div>
    </div>
  )
}
