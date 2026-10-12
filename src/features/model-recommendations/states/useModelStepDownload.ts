'use client'

import { useModelRecommendationsQuery } from '@/cores/api-queries'
import { modelStepService } from '@/features/model-recommendations/services/model-step'
import { useShallow } from 'zustand/react/shallow'
import { useModelStepStore } from './useModelStepStore'
import { useRecommendationDownload } from './useRecommendationDownload'

/** The Download button: the picked model and its download progress. */
export const useModelStepDownload = () => {
  const { data } = useModelRecommendationsQuery()
  const picks = useModelStepStore(
    useShallow((state) => ({
      pickedSectionId: state.pickedSectionId,
      pickedModelId: state.pickedModelId
    }))
  )
  const { model } = modelStepService.toSelection(picks, data)
  const download = useRecommendationDownload(model?.id)

  const label = download.isDownloading
    ? `Downloading ${Math.round(download.progressPercent)}%`
    : `Download ${model?.name}`

  return {
    label,
    isDownloading: download.isDownloading,
    isDisabled: download.isDisabled,
    onDownload: download.onDownload
  }
}
