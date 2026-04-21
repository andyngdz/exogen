import {
  ModelLoadProgressResponse,
  ModelLoadStartedResponse,
  SocketEvents,
  useSocketEvent
} from '@/cores/sockets'
import { useCallback } from 'react'
import { useModelLoadProgressStore } from './useModelLoadProgressStore'

export const useModelLoadProgress = () => {
  const { model_id, progress, onUpdateProgress, onSetModelId, reset } =
    useModelLoadProgressStore()

  const onLoadStarted = useCallback(
    (data: ModelLoadStartedResponse) => {
      onSetModelId(data.model_id)
    },
    [onSetModelId]
  )

  const onLoadProgress = useCallback(
    (data: ModelLoadProgressResponse) => {
      onUpdateProgress(data)
    },
    [onUpdateProgress]
  )

  const onLoadCompleted = useCallback(() => {
    reset()
  }, [reset])

  useSocketEvent(SocketEvents.MODEL_LOAD_STARTED, onLoadStarted, [
    onLoadStarted
  ])
  useSocketEvent(SocketEvents.MODEL_LOAD_PROGRESS, onLoadProgress, [
    onLoadProgress
  ])
  useSocketEvent(SocketEvents.MODEL_LOAD_COMPLETED, onLoadCompleted, [
    onLoadCompleted
  ])

  const percentage = progress
    ? Math.round((progress.step / progress.total) * 100)
    : 0

  return {
    isLoading: !!model_id,
    message: progress?.message || 'Loading model...',
    percentage
  }
}
