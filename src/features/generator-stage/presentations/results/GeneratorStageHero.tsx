import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { useRecentRuns } from '@/features/generator-stage/states/useRecentRuns'
import { ImageGenerationStepEndResponse } from '@/types'
import clsx from 'clsx'
import { isEmpty } from 'es-toolkit/compat'
import { FC } from 'react'
import { GeneratorStageImage } from './GeneratorStageImage'
import { GeneratorStageToolbar } from './GeneratorStageToolbar'

interface GeneratorStageHeroProps {
  imageStepEnd?: ImageGenerationStepEndResponse
}

export const GeneratorStageHero: FC<GeneratorStageHeroProps> = ({
  imageStepEnd
}) => {
  const aspectRatio = useGeneratorAspectRatio()
  const { recentRuns } = useRecentRuns()
  // With no run yet the hero only shows in image to image, next to the input.
  const emptyLabel = isEmpty(recentRuns)
    ? 'Add an input image on the left, then generate.'
    : 'Generate to see your images here, or reuse a recent run below.'

  return (
    <div
      className={clsx(
        'relative h-full max-w-full',
        'overflow-hidden rounded-2xl bg-surface'
      )}
      style={{ aspectRatio }}
    >
      {!imageStepEnd && (
        <span
          className={clsx(
            'flex h-full items-center justify-center',
            'p-8 text-sm text-muted'
          )}
        >
          {emptyLabel}
        </span>
      )}
      {imageStepEnd && (
        <>
          <GeneratorStageImage imageStepEnd={imageStepEnd} />
          <div className="absolute top-3 right-3 z-10">
            <GeneratorStageToolbar index={imageStepEnd.index} />
          </div>
        </>
      )}
    </div>
  )
}
