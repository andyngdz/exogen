import { usePromptInputs } from '@/features/generator-prompts/states/usePromptInputs'
import { useGeneratorSubmit } from '@/features/generators/states'
import { isEmpty } from 'es-toolkit/compat'
import { KeyboardEvent, useState } from 'react'

/** Prompt fields, the negative prompt toggle and Ctrl+Enter for the dock. */
export const useGeneratorDock = () => {
  const promptInputs = usePromptInputs()
  const { onSubmit, isDisabled, isGenerating, disabledReason } =
    useGeneratorSubmit()
  const [isNegativeToggled, setIsNegativeToggled] = useState(false)

  const isNegativeOpen =
    isNegativeToggled || !isEmpty(promptInputs.negativePrompt)

  const onToggleNegative = () => setIsNegativeToggled(!isNegativeOpen)

  const onPromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isSubmitKey =
      event.key === 'Enter' && (event.ctrlKey || event.metaKey)

    if (!isSubmitKey) return

    event.preventDefault()
    onSubmit()
  }

  return {
    ...promptInputs,
    isNegativeOpen,
    onToggleNegative,
    onPromptKeyDown,
    onSubmit,
    isDisabled,
    isGenerating,
    disabledReason
  }
}
