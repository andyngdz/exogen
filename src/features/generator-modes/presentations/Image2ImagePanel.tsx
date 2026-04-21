'use client'

import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { ImageInput } from '@/features/generator-image-input/presentations/ImageInput'
import { GeneratorPreviewer } from '@/features/generator-previewers'
import {
  useImage2ImageConfigStore,
  useImage2ImageGenerator
} from '@/features/generators'
import { useFormContext } from 'react-hook-form'
import { GeneratorModePanelLayout } from './GeneratorModePanelLayout'

export const Image2ImagePanel = () => {
  const { onGenerate } = useImage2ImageGenerator()
  const { handleSubmit } = useFormContext<GeneratorConfigFormValues>()
  const { initImageBase64 } = useImage2ImageConfigStore()

  return (
    <GeneratorModePanelLayout
      onGenerate={handleSubmit(onGenerate)}
      isGenerateDisabled={!initImageBase64}
    >
      <GeneratorPreviewer leadingItem={<ImageInput />} />
    </GeneratorModePanelLayout>
  )
}
