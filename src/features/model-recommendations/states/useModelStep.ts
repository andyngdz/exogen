'use client'

import { modelStepService } from '@/features/model-recommendations/services/model-step'
import { ValueChanged } from '@/types'
import { first, isEmpty, map } from 'es-toolkit/compat'
import { useEffect } from 'react'
import type { Selection } from 'react-aria-components'
import { useShallow } from 'zustand/react/shallow'
import { useModelRecommendation } from './useModelRecommendation'
import { MODEL_STEP_ACTIONS, useModelStepStore } from './useModelStepStore'

/** The Model step: one section of recommendations at a time, one model picked to download. */
export const useModelStep = () => {
  const { data, isDownloading, onSkip, onBack } = useModelRecommendation()
  const picks = useModelStepStore(
    useShallow((state) => ({
      pickedSectionId: state.pickedSectionId,
      pickedModelId: state.pickedModelId
    }))
  )
  const { sections, section, models, model } = modelStepService.toSelection(
    picks,
    data
  )

  // Start the next visit from the backend's defaults again.
  useEffect(() => MODEL_STEP_ACTIONS.reset, [])

  const onSectionChange: ValueChanged<Selection> = (selection) => {
    if (selection === 'all') return
    const sectionId = first(Array.from(selection))
    if (sectionId) MODEL_STEP_ACTIONS.pickSection(sectionId)
  }

  return {
    sectionOptions: map(sections, ({ id, name }) => ({ id, name })),
    hasManySections: sections.length > 1,
    sectionId: section?.id,
    models,
    model,
    isLoading: !data,
    hasNoModels: Boolean(data) && isEmpty(models),
    isDownloading,
    onSectionChange,
    onModelChange: MODEL_STEP_ACTIONS.pickModel,
    onSkip,
    onBack
  }
}
