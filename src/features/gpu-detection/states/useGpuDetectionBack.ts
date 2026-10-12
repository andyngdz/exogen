'use client'

import { useRouter } from 'next/navigation'

/** Back to the Backend step. */
export const useGpuDetectionBack = () => {
  const router = useRouter()

  return { onBack: router.back }
}
