'use client'

import { useConfig } from '@/cores/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useBackendHealth } from './useBackendHealth'

/**
 * Hook that runs the health check's side effects once per screen.
 * A configured device skips onboarding straight to the editor once the
 * backend and config are ready; first-run setup waits for Continue.
 */
export const useHealthCheck = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isHealthy } = useBackendHealth()
  const { isHasDevice, isLoading } = useConfig()

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
}
