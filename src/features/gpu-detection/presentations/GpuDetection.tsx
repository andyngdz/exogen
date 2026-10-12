'use client'

import {
  MemoryScaleFactorItems,
  MemoryScaleFactorPreview
} from '@/cores/presentations/memory-scale-factor'
import { useHardwareStep } from '@/features/gpu-detection/states/useHardwareStep'
import { OnboardingLayout } from '@/features/setup-layout/presentations/OnboardingLayout'
import { OnboardingStep } from '@/features/setup-layout/types'
import { Button, Card, Spinner } from '@heroui/react'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import { FormProvider } from 'react-hook-form'
import { GpuDetectionCpuModeOnly } from './GpuDetectionCpuModeOnly'
import { HardwareGpuCard } from './HardwareGpuCard'

/** Onboarding step 2, per frame 2f: the GPU and the memory limits on one screen. */
export const GpuDetection = () => {
  const step = useHardwareStep()

  return (
    <FormProvider {...step.gpuForm}>
      <OnboardingLayout
        step={OnboardingStep.HARDWARE}
        title="Your hardware"
        description="Pick how much memory models may use. You can change this later in Settings."
        footer={
          <>
            <Button variant="ghost" onPress={step.onBack}>
              <ChevronLeft size={16} />
              Back
            </Button>
            <Button
              variant="primary"
              isDisabled={step.isContinueDisabled}
              onPress={step.onContinue}
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          </>
        }
      >
        {!step.hardware && <Spinner aria-label="Detecting hardware" />}
        {step.selectedGpu && step.hardware?.is_cuda && (
          <HardwareGpuCard
            hardware={step.hardware}
            gpu={step.selectedGpu}
            hasManyGpus={step.hasManyGpus}
          />
        )}
        {step.hardware && !step.hardware.is_cuda && (
          <Card>
            <Card.Content>
              <GpuDetectionCpuModeOnly onCheckAgain={step.onCheckAgain} />
            </Card.Content>
          </Card>
        )}
        <Card>
          <Card.Content className="flex flex-col gap-4">
            <h2 className="font-semibold">Max memory</h2>
            <MemoryScaleFactorItems
              gpuScaleFactor={step.memory.gpuScaleFactor}
              ramScaleFactor={step.memory.ramScaleFactor}
              onGpuChange={step.memory.onGpuChange}
              onRamChange={step.memory.onRamChange}
            />
            <MemoryScaleFactorPreview
              gpuScaleFactor={step.memory.gpuScaleFactor}
              ramScaleFactor={step.memory.ramScaleFactor}
            />
          </Card.Content>
        </Card>
      </OnboardingLayout>
    </FormProvider>
  )
}
