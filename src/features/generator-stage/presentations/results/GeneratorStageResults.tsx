import clsx from 'clsx'
import { ImageInput } from '@/features/generator-image-input/presentations/ImageInput'
import { GeneratorPreviewerGrid } from '@/features/generator-previewers/presentations/GeneratorPreviewerGrid'
import { useStageResults } from '@/features/generator-stage/states/useStageResults'
import { GeneratorStageRecentRuns } from './GeneratorStageRecentRuns'
import { GeneratorStageSingle } from './GeneratorStageSingle'

export const GeneratorStageResults = () => {
  const { isSingleView, isImageMode } = useStageResults()

  if (isSingleView) return <GeneratorStageSingle />

  const leadingItem = isImageMode && <ImageInput />

  return (
    <div
      className={clsx('flex flex-1 flex-col gap-4', 'w-full max-w-6xl px-4')}
    >
      <GeneratorPreviewerGrid leadingItem={leadingItem} />
      <GeneratorStageRecentRuns />
    </div>
  )
}
