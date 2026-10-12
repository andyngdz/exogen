import { useModelLoadProgressStore } from './useModelLoadProgressStore'

/** Read-only view of the model load for the stage, the top bar and the dock. */
export const useModelLoadStatus = () => {
  const modelId = useModelLoadProgressStore((state) => state.model_id)
  const progress = useModelLoadProgressStore((state) => state.progress)

  const percentage = progress
    ? Math.round((progress.step / progress.total) * 100)
    : 0

  return {
    isLoading: !!modelId,
    modelId,
    message: progress?.message || 'Loading model...',
    percentage
  }
}
