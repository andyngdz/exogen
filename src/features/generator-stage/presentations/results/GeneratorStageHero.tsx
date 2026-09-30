import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { ImageGenerationStepEndResponse } from '@/types'
import clsx from 'clsx'
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
          Generate to see your images here, or reuse a recent run below.
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
