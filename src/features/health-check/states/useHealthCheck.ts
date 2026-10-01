'use client'

import { useHealthQuery } from '@/cores/api-queries'
import { useBackendInitStore } from '@/cores/backend-initialization'
import { useConfig } from '@/cores/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook that encapsulates health check logic and routing behavior.
 * Waits for both backend health check AND config query to complete
 * before making routing decisions.
 */
export const useHealthCheck = () => {
  const router = useRouter()
  const isInitialized = useBackendInitStore((state) => state.isInitialized)
  const { data } = useHealthQuery(isInitialized)
  const { isHasDevice, isLoading } = useConfig()
  const isHealthy = !!data

  const nextRoute = isHasDevice ? '/editor' : '/gpu-detection'

  useEffect(() => {
    if (!isHealthy || isLoading) return

    router.push(nextRoute)
  }, [isHealthy, router, isLoading, nextRoute])

  return {
    isHealthy,
    onContinue: () => router.push(nextRoute)
  }
}
