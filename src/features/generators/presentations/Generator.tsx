'use client'

import { GeneratorDock } from '@/features/generator-dock'
import { GeneratorInspector } from '@/features/generator-inspector'
import { GeneratorPhotoviewModal } from '@/features/generator-photoview'
import { GeneratorStage } from '@/features/generator-stage'
import { useGeneratorLayout } from '@/features/generators/states/useGeneratorLayout'
import { Histories } from '@/features/histories'
import { Form, ProgressBar } from '@heroui/react'
import { FormProvider } from 'react-hook-form'
import { GeneratorTopBar } from './GeneratorTopBar'

export const Generator = () => {
  const { isMounted, methods, isHistoryOpen, canMountPhotoview } =
    useGeneratorLayout()

  if (!isMounted)
    return (
      <ProgressBar isIndeterminate aria-label="Loading..." size="sm">
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    )

  return (
    <FormProvider {...methods}>
      <Form
        aria-label="Generator"
        onSubmit={(event) => {
          event.preventDefault()
        }}
        className="flex h-full w-full"
      >
        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-4">
          <GeneratorTopBar />
          <GeneratorStage />
          <div className="flex justify-center px-4">
            <GeneratorDock />
          </div>
        </main>
        <GeneratorInspector />
        {isHistoryOpen && (
          <aside
            aria-label="History"
            className="w-75 shrink-0 border-l border-separator"
          >
            <Histories />
          </aside>
        )}
      </Form>
      {canMountPhotoview && <GeneratorPhotoviewModal />}
    </FormProvider>
  )
}
