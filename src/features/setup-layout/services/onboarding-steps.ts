import {
  OnboardingStep,
  OnboardingStepState,
  OnboardingStepView
} from '@/features/setup-layout/types'
import { findIndex, map } from 'es-toolkit/compat'

const STEPS = [
  { step: OnboardingStep.BACKEND, label: 'Backend' },
  { step: OnboardingStep.HARDWARE, label: 'Hardware' },
  { step: OnboardingStep.MODEL, label: 'Model' }
]

export class OnboardingStepsService {
  /** The three setup steps, marked done, current (or failed) and upcoming. */
  toStepViews(
    current: OnboardingStep,
    isFailed: boolean
  ): OnboardingStepView[] {
    const currentIndex = findIndex(STEPS, { step: current })

    return map(STEPS, ({ step, label }, index) => ({
      step,
      label,
      number: index + 1,
      state: this.toState(index, currentIndex, isFailed)
    }))
  }

  private toState(index: number, currentIndex: number, isFailed: boolean) {
    if (index < currentIndex) return OnboardingStepState.DONE
    if (index > currentIndex) return OnboardingStepState.UPCOMING
    if (isFailed) return OnboardingStepState.FAILED
    return OnboardingStepState.CURRENT
  }
}

export const onboardingStepsService = new OnboardingStepsService()
