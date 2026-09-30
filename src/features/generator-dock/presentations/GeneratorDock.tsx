'use client'

import { useGeneratorDock } from '@/features/generator-dock/states/useGeneratorDock'
import { Button, FieldError, TextArea, TextField } from '@heroui/react'
import clsx from 'clsx'
import { GeneratorDockAction } from './GeneratorDockAction'
import { GeneratorDockPills } from './GeneratorDockPills'

export const GeneratorDock = () => {
  const dock = useGeneratorDock()

  return (
    <section
      aria-label="Prompt"
      className={clsx(
        'flex w-175 max-w-full flex-col gap-2 p-4',
        'rounded-3xl bg-overlay shadow-overlay'
      )}
    >
      <TextField
        aria-label="Prompt"
        maxLength={1000}
        value={dock.prompt}
        onChange={dock.onPromptChange}
        isInvalid={dock.isPromptInvalid}
      >
        <TextArea
          rows={2}
          variant="secondary"
          placeholder="Describe the image you want to create"
          onKeyDown={dock.onPromptKeyDown}
        />
        <FieldError>{dock.promptErrorMessage}</FieldError>
      </TextField>
      {dock.isNegativeOpen && (
        <TextField
          aria-label="Negative prompt"
          maxLength={1000}
          value={dock.negativePrompt}
          onChange={dock.onNegativePromptChange}
        >
          <TextArea
            rows={1}
            variant="secondary"
            placeholder="What to keep out of the image"
          />
        </TextField>
      )}
      <div className="flex items-end gap-4">
        <div className="flex flex-1 flex-col items-start gap-2">
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={dock.isNegativeOpen}
            onPress={dock.onToggleNegative}
          >
            Negative prompt
          </Button>
          <GeneratorDockPills />
        </div>
        <GeneratorDockAction
          isDisabled={dock.isDisabled}
          isGenerating={dock.isGenerating}
          disabledReason={dock.disabledReason}
          onSubmit={dock.onSubmit}
        />
      </div>
    </section>
  )
}
