import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { ImageGenerationStepEndResponse } from '@/types'
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
      className="relative h-110 max-w-full overflow-hidden rounded-2xl bg-surface"
      style={{ aspectRatio }}
    >
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
