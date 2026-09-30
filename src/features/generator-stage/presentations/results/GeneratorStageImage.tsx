import { GeneratorImageRenderer } from '@/features/generator-previewers/presentations/GeneratorImageRenderer'
import { useStageImage } from '@/features/generator-stage/states/useStageImage'
import { ImageGenerationStepEndResponse } from '@/types'
import { FC } from 'react'

interface GeneratorStageImageProps {
  imageStepEnd: ImageGenerationStepEndResponse
}

export const GeneratorStageImage: FC<GeneratorStageImageProps> = ({
  imageStepEnd
}) => {
  const image = useStageImage(imageStepEnd)

  return <GeneratorImageRenderer {...image} />
}
