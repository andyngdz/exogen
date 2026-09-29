import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'
import { useController } from 'react-hook-form'

export const usePromptInputs = () => {
  const { control } = useGeneratorConfigForm()
  const { field: promptField, fieldState: promptState } = useController({
    control,
    name: 'prompt',
    rules: { required: 'Prompt is required' }
  })
  const { field: negativePromptField } = useController({
    control,
    name: 'negative_prompt'
  })

  return {
    prompt: promptField.value,
    onPromptChange: promptField.onChange,
    isPromptInvalid: promptState.invalid,
    promptErrorMessage: promptState.error?.message,
    negativePrompt: negativePromptField.value,
    onNegativePromptChange: negativePromptField.onChange
  }
}
