import { ImageInput } from '@/features/generator-image-input/presentations/ImageInput'
import { useStageSingle } from '@/features/generator-stage/states/useStageSingle'
import { ArrowRight } from 'lucide-react'
import { GeneratorStageHero } from './GeneratorStageHero'
import { GeneratorStageRecentRuns } from './GeneratorStageRecentRuns'
import { GeneratorStageRunStrip } from './GeneratorStageRunStrip'

export const GeneratorStageSingle = () => {
  const {
    imageStepEnds,
    hasRun,
    isImageMode,
    selectedStepEnd,
    selectedIndex,
    onSelect
  } = useStageSingle()

  return (
    <>
      <div className="flex items-center gap-4">
        {isImageMode && (
          <>
            <div className="flex w-75 flex-col gap-2">
              <span className="text-xs text-muted">Input</span>
              <ImageInput />
            </div>
            <ArrowRight size={16} className="text-muted" />
          </>
        )}
        <div className="flex flex-col gap-2">
          {isImageMode && <span className="text-xs text-muted">Output</span>}
          <GeneratorStageHero imageStepEnd={selectedStepEnd} />
        </div>
      </div>
      <div className="flex items-end gap-4">
        {hasRun && (
          <GeneratorStageRunStrip
            imageStepEnds={imageStepEnds}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
          />
        )}
        <GeneratorStageRecentRuns />
      </div>
    </>
  )
}
