'use client'

import { FullScreenLoader } from '@/cores/presentations'
import { GenerationPhaseStepper } from '@/features/generation-phase-stepper'
import { GeneratorConfig } from '@/features/generator-configs'
import { ModeTabs } from '@/features/generator-modes'
import { GeneratorPhotoviewModal } from '@/features/generator-photoview'
import { useGeneratorLayout } from '@/features/generators/states/useGeneratorLayout'
import { Histories } from '@/features/histories'
import { Form, ProgressBar } from '@heroui/react'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import clsx from 'clsx'
import { FormProvider } from 'react-hook-form'

export const Generator = () => {
  const { isMounted, methods, loadingMessage, canMountPhotoview } =
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
      <div className="relative w-full h-full">
        <Form
          aria-label="Generator"
          onSubmit={(event) => {
            event.preventDefault()
          }}
          className={clsx('w-full h-full opacity-0 transition-opacity', {
            'opacity-100': isMounted
          })}
        >
          <Allotment defaultSizes={[300, 0, 300]}>
            <Allotment.Pane maxSize={350} minSize={300} preferredSize={300}>
              <GeneratorConfig />
            </Allotment.Pane>
            <Allotment.Pane>
              <ModeTabs />
            </Allotment.Pane>
            <Allotment.Pane maxSize={350} minSize={300} preferredSize={300}>
              <Histories />
            </Allotment.Pane>
          </Allotment>
        </Form>
        {loadingMessage && <FullScreenLoader message={loadingMessage} />}
        <GenerationPhaseStepper />
        {canMountPhotoview && <GeneratorPhotoviewModal />}
      </div>
    </FormProvider>
  )
}
