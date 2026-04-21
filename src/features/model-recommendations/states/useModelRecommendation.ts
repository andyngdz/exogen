import { useModelRecommendationsQuery } from '@/cores/api-queries'
import { SocketEvents, useSocketEvent } from '@/cores/sockets'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export const useModelRecommendation = () => {
  const router = useRouter()
  const { data } = useModelRecommendationsQuery()

  const onNext = useCallback(() => {
    router.replace('/editor')
  }, [router])

  const onSkip = useCallback(() => {
    router.replace('/editor')
  }, [router])

  const onDownloadCompleted = useCallback(() => {
    router.replace('/editor')
  }, [router])

  useSocketEvent(SocketEvents.DOWNLOAD_COMPLETED, onDownloadCompleted, [
    onDownloadCompleted
  ])

  return { onNext, onSkip, data }
}
