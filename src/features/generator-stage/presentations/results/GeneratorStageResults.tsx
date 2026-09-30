import { ImageInput } from '@/features/generator-image-input/presentations/ImageInput'
import { GeneratorPreviewerGrid } from '@/features/generator-previewers/presentations/GeneratorPreviewerGrid'
import { useStageResults } from '@/features/generator-stage/states/useStageResults'
import { GeneratorStageSingle } from './GeneratorStageSingle'

export const GeneratorStageResults = () => {
  const { isSingleView, isImageMode } = useStageResults()

  if (isSingleView) return <GeneratorStageSingle />

  const leadingItem = isImageMode && <ImageInput />

  return (
    <div className="w-full max-w-6xl flex-1 px-4">
      <GeneratorPreviewerGrid leadingItem={leadingItem} />
    </div>
  )
}
