import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { useGeneratorConfigSeed } from '@/features/generator-config-seed/states/useGeneratorConfigSeed'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { Button } from '@heroui/react'
import { Dices } from 'lucide-react'

export const GeneratorInspectorSeed = () => {
  const { onRandomizeSeed } = useGeneratorConfigSeed()

  return (
    <div className="flex items-center gap-2">
      <NumberInputController<GeneratorConfigFormValues>
        aria-label="Seed"
        controlName="seed"
        minValue={-1}
        description="-1 picks a new random seed for every run"
      />
      <Button
        isIconOnly
        variant="ghost"
        aria-label="New seed"
        onPress={onRandomizeSeed}
      >
        <Dices size={16} />
      </Button>
    </div>
  )
}
