'use client'

import { GeneratorAction } from '@/features/generator-actions'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { GeneratorPreviewer } from '@/features/generator-previewers'
import { PromptInputs } from '@/features/generator-prompts'
import { useGenerator } from '@/features/generators'
import { useFormContext } from 'react-hook-form'

export const Text2ImagePanel = () => {
  const { onGenerate } = useGenerator()
  const { handleSubmit } = useFormContext<GeneratorConfigFormValues>()

  return (
    <div className="flex flex-col h-full gap-4">
      <PromptInputs />
      <GeneratorAction onGenerate={handleSubmit(onGenerate)} />
      <div className="flex-1 min-h-0">
        <GeneratorPreviewer />
      </div>
    </div>
  )
}
