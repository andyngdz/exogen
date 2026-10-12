'use client'

import { useHealthQuery } from '@/cores/api-queries'
import { useBackendInitStore } from '@/cores/backend-initialization'
import { useConfig } from '@/cores/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook that encapsulates health check logic and routing behavior.
 * A configured device skips onboarding straight to the editor once the
 * backend and config are ready; first-run setup waits for Continue.
 */
export const useHealthCheck = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isInitialized = useBackendInitStore((state) => state.isInitialized)
  const { data } = useHealthQuery(isInitialized)
  const { isHasDevice, isLoading } = useConfig()
  const isHealthy = !!data

  const nextRoute = isHasDevice ? '/editor' : '/gpu-detection'

  // The config query fires on mount and gives up after its retries, while
  // backend setup can take longer than that; reload it once the backend is up.
  useEffect(() => {
    if (!isHealthy) return

    queryClient.invalidateQueries({ queryKey: ['config'] })
  }, [isHealthy, queryClient])

  useEffect(() => {
    if (!isHealthy || isLoading || !isHasDevice) return

    router.push('/editor')
  }, [isHealthy, router, isLoading, isHasDevice])

  return {
    isHealthy,
    onContinue: () => router.push(nextRoute)
  }
}
