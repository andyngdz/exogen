'use client'

import { GeneratorAction } from '@/features/generator-actions'
import { PromptInputs } from '@/features/generator-prompts'
import { ReactNode } from 'react'
import clsx from 'clsx'

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
      <div
        className={clsx(
          'sticky bottom-0 z-10 shrink-0',
          'border-t border-border py-2',
          'bg-background/90 backdrop-blur-md'
        )}
      >
        <GeneratorAction
          onGenerate={onGenerate}
          isGenerateDisabled={isGenerateDisabled}
        />
      </div>
    </div>
  )
}
