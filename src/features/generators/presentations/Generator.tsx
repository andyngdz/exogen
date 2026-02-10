'use client'

import { FullScreenLoader } from '@/cores/presentations'
import { GenerationPhaseStepper } from '@/features/generation-phase-stepper'
import { GeneratorConfig } from '@/features/generator-configs'
import { ModeTabs } from '@/features/generator-modes'
import { GeneratorPhotoviewModal } from '@/features/generator-photoview'
import { useGeneratorPhotoviewStore } from '@/features/generator-photoview/states/useGeneratorPhotoviewStore'
import { Histories } from '@/features/histories'
import { useModelLoadProgressStore } from '@/features/model-load-progress'
import {
  useGenerationStatusStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { Progress } from '@heroui/react'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import clsx from 'clsx'
import { isEmpty } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { useMountedState } from 'react-use'
import { useGeneratorForm } from '../states'

export const Generator = () => {
  const isMounted = useMountedState()
  const mounted = isMounted()
  const { methods } = useGeneratorForm()
  const { progress } = useModelLoadProgressStore()
  const { isGenerating } = useGenerationStatusStore()
  const { items } = useUseImageGenerationStore()
  const { isOpen: isPhotoviewOpen, closePhotoview } =
    useGeneratorPhotoviewStore()

  const canMountPhotoview = !isGenerating && !isEmpty(items)

  useEffect(() => {
    if (!isPhotoviewOpen) return
    if (canMountPhotoview) return
    closePhotoview()
  }, [canMountPhotoview, closePhotoview, isPhotoviewOpen])

  if (!mounted)
    return <Progress isIndeterminate aria-label="Loading..." size="sm" />

  return (
    <FormProvider {...methods}>
      <div className="relative w-full h-full">
        <form
          name="generator"
          onSubmit={(event) => {
            event.preventDefault()
          }}
          className={clsx('w-full h-full opacity-0 transition-opacity', {
            'opacity-100': mounted
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
        </form>
        {progress && <FullScreenLoader message={progress.message} />}
        <GenerationPhaseStepper />
        {canMountPhotoview && <GeneratorPhotoviewModal />}
      </div>
    </FormProvider>
  )
}
