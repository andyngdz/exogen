'use client'

import { ValueChanged } from '@/types'
import { find, first, isEmpty, map } from 'es-toolkit/compat'
import { useState } from 'react'
import type { Key, Selection } from 'react-aria-components'
import { useModelRecommendation } from './useModelRecommendation'

/** The Model step: one section of recommendations at a time, one model picked to download. */
export const useModelStep = () => {
  const { data, isDownloading, onSkip, onBack } = useModelRecommendation()
  const [pickedSectionId, setPickedSectionId] = useState<Key>()
  const [pickedModelId, setPickedModelId] = useState<string>()

  const sections = data?.sections ?? []
  const section =
    find(sections, (option) => option.id === pickedSectionId) ??
    find(sections, (option) => option.id === data?.default_section) ??
    first(sections)
  const models = section?.models ?? []
  // Keep the pick only while it is in the shown section; otherwise use the backend's pick.
  const model =
    find(models, (option) => option.id === pickedModelId) ??
    find(models, (option) => option.id === data?.default_selected_id) ??
    find(models, (option) => option.is_recommended) ??
    first(models)

  const onSectionChange: ValueChanged<Selection> = (selection) => {
    if (selection === 'all') return
    setPickedSectionId(first(Array.from(selection)))
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
    onModelChange: setPickedModelId,
    onSkip,
    onBack
  }
}
