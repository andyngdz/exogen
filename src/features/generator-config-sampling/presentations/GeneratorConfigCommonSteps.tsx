import { COMMON_STEPS } from '@/features/generator-config-sampling/constants'
import { useGeneratorConfigCommonSteps } from '@/features/generator-config-sampling/states/useGeneratorConfigCommonSteps'
import { Button } from '@heroui/react'
import { map } from 'es-toolkit/compat'

export const GeneratorConfigCommonSteps = () => {
  const { onStepSelect } = useGeneratorConfigCommonSteps()

  return (
    <div className="flex">
      {map(COMMON_STEPS, (step) => (
        <Button
          key={step}
          variant="ghost"
          className="text-foreground"
          onPress={() => onStepSelect(step)}
          isIconOnly
        >
          {step}
        </Button>
      ))}
    </div>
  )
}
