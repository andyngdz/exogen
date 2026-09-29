import { useGeneratorActionSubmit } from '@/features/generator-actions/states/useGeneratorActionSubmit'
import { Button } from '@heroui/react'
import clsx from 'clsx'

interface GeneratorActionSubmitButtonProps {
  onPress: VoidFunction
  isDisabled?: boolean
}

export const GeneratorActionSubmitButton = ({
  onPress,
  isDisabled
}: GeneratorActionSubmitButtonProps) => {
  const { numberOfImages, isGenerating } = useGeneratorActionSubmit()

  return (
    <Button
      variant="primary"
      type="button"
      className="opacity-100"
      isDisabled={isGenerating || isDisabled}
      onPress={onPress}
    >
      <span
        className={clsx({
          'animate-shine text-accent/50': isGenerating
        })}
      >
        Generate {numberOfImages} images
      </span>
    </Button>
  )
}
