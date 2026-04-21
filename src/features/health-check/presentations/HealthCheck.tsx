'use client'

import { SetupLayout } from '@/features/setup-layout/presentations'
import { useBackendSetupStatus, useHealthCheck } from '../states'
import { HealthCheckContent } from './HealthCheckContent'

export const HealthCheck = () => {
  const { isHealthy } = useHealthCheck()
  const { entries } = useBackendSetupStatus()

  return (
    <SetupLayout
      title="Health Check"
      description="Checking the connection to your ExoGen backend server"
      isNextDisabled={!isHealthy}
    >
      <HealthCheckContent isHealthy={isHealthy} statuses={entries} />
    </SetupLayout>
  )
}
