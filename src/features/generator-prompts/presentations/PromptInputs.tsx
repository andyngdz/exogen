import { usePromptInputs } from '@/features/generator-prompts/states/usePromptInputs'
import { FieldError, Label, TextArea, TextField } from '@heroui/react'

export const PromptInputs = () => {
  const {
    prompt,
    onPromptChange,
    isPromptInvalid,
    promptErrorMessage,
    negativePrompt,
    onNegativePromptChange
  } = usePromptInputs()

  return (
    <div className="flex gap-4">
      <TextField
        className="font-mono flex-1"
        maxLength={1000}
        value={prompt}
        onChange={onPromptChange}
        isInvalid={isPromptInvalid}
      >
        <Label>Prompt</Label>
        <TextArea rows={3} />
        <FieldError>{promptErrorMessage}</FieldError>
      </TextField>
      <TextField
        className="font-mono flex-1"
        maxLength={1000}
        value={negativePrompt}
        onChange={onNegativePromptChange}
      >
        <Label>Negative prompt</Label>
        <TextArea rows={3} />
      </TextField>
    </div>
  )
}
