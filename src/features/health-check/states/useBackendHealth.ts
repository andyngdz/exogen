'use client'

import { useHealthQuery } from '@/cores/api-queries'
import { useBackendInitStore } from '@/cores/backend-initialization'

/** Whether the backend answers its health check, once it has started. */
export const useBackendHealth = () => {
  const isInitialized = useBackendInitStore((state) => state.isInitialized)
  const { data } = useHealthQuery(isInitialized)

  return { isHealthy: !!data }
}
