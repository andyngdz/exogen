import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { useGeneratorConfigSeed } from '@/features/generator-config-seed/states/useGeneratorConfigSeed'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { Button } from '@heroui/react'
import { Dices } from 'lucide-react'

export const GeneratorInspectorSeed = () => {
  const { isRandomSeed, onRandomizeSeed } = useGeneratorConfigSeed()

  if (isRandomSeed) {
    return (
      <span className="text-sm text-muted">
        Each run picks a new seed. Turn Random off to reuse one.
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <NumberInputController<GeneratorConfigFormValues>
        aria-label="Seed"
        controlName="seed"
        minValue={0}
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
