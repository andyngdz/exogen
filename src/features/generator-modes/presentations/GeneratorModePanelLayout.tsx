'use client'

import { GeneratorAction } from '@/features/generator-actions'
import { PromptInputs } from '@/features/generator-prompts'
import { ReactNode } from 'react'

interface GeneratorModePanelLayoutProps {
  onGenerate: VoidFunction
  isGenerateDisabled?: boolean
  children: ReactNode
}

export const GeneratorModePanelLayout = ({
  onGenerate,
  isGenerateDisabled,
  children
}: GeneratorModePanelLayoutProps) => {
  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      <PromptInputs />
      <div className="flex-1 min-h-0">{children}</div>
      <div className="sticky bottom-0 z-10 mt-auto shrink-0 border-t border-default bg-background/90 backdrop-blur-md py-3">
        <GeneratorAction
          onGenerate={onGenerate}
          isGenerateDisabled={isGenerateDisabled}
        />
      </div>
    </div>
  )
}
