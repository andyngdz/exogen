'use client'

import { useHealthQuery } from '@/cores/api-queries'
import { useBackendInitStore } from '@/cores/backend-initialization'
import { useConfig } from '@/cores/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook that encapsulates health check logic and routing behavior.
 * A configured device skips onboarding straight to the editor once the
 * backend and config are ready; first-run setup waits for Continue.
 */
export const useHealthCheck = () => {
  const router = useRouter()
  const isInitialized = useBackendInitStore((state) => state.isInitialized)
  const { data } = useHealthQuery(isInitialized)
  const { isHasDevice, isLoading } = useConfig()
  const isHealthy = !!data

  const nextRoute = isHasDevice ? '/editor' : '/gpu-detection'

  useEffect(() => {
    if (!isHealthy || isLoading || !isHasDevice) return

    router.push('/editor')
  }, [isHealthy, router, isLoading, isHasDevice])

  return {
    isHealthy,
    onContinue: () => router.push(nextRoute)
  }
}
