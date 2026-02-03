'use client'

import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { GeneratorPreviewer } from '@/features/generator-previewers'
import { useGenerator } from '@/features/generators'
import { useFormContext } from 'react-hook-form'
import { GeneratorModePanelLayout } from './GeneratorModePanelLayout'

export const Text2ImagePanel = () => {
  const { onGenerate } = useGenerator()
  const { handleSubmit } = useFormContext<GeneratorConfigFormValues>()

  return (
    <GeneratorModePanelLayout onGenerate={handleSubmit(onGenerate)}>
      <GeneratorPreviewer />
    </GeneratorModePanelLayout>
  )
}
