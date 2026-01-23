'use client'

import { GeneratorAction } from '@/features/generator-actions'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { ImageInput } from '@/features/generator-image-input/presentations/ImageInput'
import { GeneratorPreviewer } from '@/features/generator-previewers'
import { PromptInputs } from '@/features/generator-prompts'
import {
  useImage2ImageConfigStore,
  useImage2ImageGenerator
} from '@/features/generators'
import { useFormContext } from 'react-hook-form'

export const Image2ImagePanel = () => {
  const { onGenerate } = useImage2ImageGenerator()
  const { handleSubmit } = useFormContext<GeneratorConfigFormValues>()
  const { initImageBase64 } = useImage2ImageConfigStore()

  return (
    <div className="flex flex-col h-full gap-4">
      <ImageInput />
      <PromptInputs />
      <GeneratorAction
        onGenerate={handleSubmit(onGenerate)}
        isGenerateDisabled={!initImageBase64}
      />
      <div className="flex-1 min-h-0">
        <GeneratorPreviewer />
      </div>
    </div>
  )
}
