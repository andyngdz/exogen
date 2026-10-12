'use client'

import { OnboardingLayout } from '@/cores/shared/onboarding/presentations/OnboardingLayout'
import { OnboardingStep } from '@/cores/shared/onboarding/types'
import { useGpuDetection } from '@/features/gpu-detection/states/useGpuDetection'
import { Card, Spinner } from '@heroui/react'
import { FormProvider } from 'react-hook-form'
import { GpuDetectionBackButton } from './GpuDetectionBackButton'
import { GpuDetectionContinueButton } from './GpuDetectionContinueButton'
import { GpuDetectionCpuModeOnly } from './GpuDetectionCpuModeOnly'
import { GpuDetectionMemory } from './GpuDetectionMemory'
import { HardwareGpuCard } from './HardwareGpuCard'

/** Onboarding step 2, per frame 2f: the GPU and the memory limits on one screen. */
export const GpuDetection = () => {
  const { form, isDetecting, hasGpuCard, isCpuOnly } = useGpuDetection()

  return (
    <FormProvider {...form}>
      <OnboardingLayout
        step={OnboardingStep.HARDWARE}
        title="Your hardware"
        description="Pick how much memory models may use. You can change this later in Settings."
        footer={
          <>
            <GpuDetectionBackButton />
            <GpuDetectionContinueButton />
          </>
        }
      >
        {isDetecting && <Spinner aria-label="Detecting hardware" />}
        {hasGpuCard && <HardwareGpuCard />}
        {isCpuOnly && (
          <Card>
            <Card.Content>
              <GpuDetectionCpuModeOnly />
            </Card.Content>
          </Card>
        )}
        <GpuDetectionMemory />
      </OnboardingLayout>
    </FormProvider>
  )
}
