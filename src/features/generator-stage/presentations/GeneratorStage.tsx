'use client'

import { GenerationPhaseStepper } from '@/features/generation-phase-stepper'
import { useGeneratorStage } from '@/features/generator-stage/states/useGeneratorStage'
import { StageView } from '@/features/generator-stage/types'
import clsx from 'clsx'
import { FC } from 'react'
import { GeneratorStageFailed } from './panels/GeneratorStageFailed'
import { GeneratorStageFirstRun } from './panels/GeneratorStageFirstRun'
import { GeneratorStageModelLoading } from './panels/GeneratorStageModelLoading'
import { GeneratorStageModelLoadingOverResults } from './panels/GeneratorStageModelLoadingOverResults'
import { GeneratorStageNoModel } from './panels/GeneratorStageNoModel'
import { GeneratorStageOffline } from './panels/GeneratorStageOffline'
import { GeneratorStageResults } from './results/GeneratorStageResults'

const STAGE_VIEWS: Record<StageView, FC> = {
  [StageView.OFFLINE]: GeneratorStageOffline,
  [StageView.MODEL_LOADING]: GeneratorStageModelLoading,
  [StageView.MODEL_LOADING_OVER_RESULTS]: GeneratorStageModelLoadingOverResults,
  [StageView.FAILED]: GeneratorStageFailed,
  [StageView.NO_MODEL]: GeneratorStageNoModel,
  [StageView.FIRST_RUN]: GeneratorStageFirstRun,
  [StageView.RESULTS]: GeneratorStageResults
}

export const GeneratorStage = () => {
  const { view } = useGeneratorStage()
  const StageViewPanel = STAGE_VIEWS[view]

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center gap-4',
        'min-h-0 flex-1 overflow-y-auto pt-2'
      )}
    >
      {/* Mounted for every view so no phase event is missed before results show. */}
      <GenerationPhaseStepper />
      <StageViewPanel />
    </div>
  )
}
