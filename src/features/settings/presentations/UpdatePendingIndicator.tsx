'use client'

import { useHasPendingUpdate } from '@/features/settings/states/useUpdaterStore'
import { UpdatePendingDot } from './UpdatePendingDot'

/** The Updates nav tab's dot, shown while a downloaded update waits. */
export const UpdatePendingIndicator = () => {
  const hasPendingUpdate = useHasPendingUpdate()

  return hasPendingUpdate && <UpdatePendingDot />
}
