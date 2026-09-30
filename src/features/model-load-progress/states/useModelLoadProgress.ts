import {
  ModelLoadProgressResponse,
  ModelLoadStartedResponse,
  SocketEvents,
  useSocketEvent
} from '@/cores/sockets'
import { useCallback } from 'react'
import { useModelLoadProgressStore } from './useModelLoadProgressStore'
import { useModelLoadStatus } from './useModelLoadStatus'

export const useModelLoadProgress = () => {
  const onUpdateProgress = useModelLoadProgressStore(
    (state) => state.onUpdateProgress
  )
  const onSetModelId = useModelLoadProgressStore((state) => state.onSetModelId)
  const reset = useModelLoadProgressStore((state) => state.reset)

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

  const { isLoading, message, percentage } = useModelLoadStatus()

  return { isLoading, message, percentage }
}
