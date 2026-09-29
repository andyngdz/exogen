import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { useGeneratorConfigSeed } from '@/features/generator-config-seed/states/useGeneratorConfigSeed'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { Button } from '@heroui/react'
import { Dices } from 'lucide-react'

export const GeneratorConfigSeed = () => {
  const { onRandomizeSeed } = useGeneratorConfigSeed()

  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Seed</span>
      <div className="flex gap-4">
        <NumberInputController<GeneratorConfigFormValues>
          aria-label="Seed"
          controlName="seed"
          minValue={-1}
          startContent={<span className="text-sm text-foreground">Value</span>}
        />
        <Button variant="ghost" onPress={onRandomizeSeed} isIconOnly>
          <Dices />
        </Button>
      </div>
    </div>
  )
}
