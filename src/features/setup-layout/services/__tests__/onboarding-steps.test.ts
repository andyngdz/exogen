import {
  OnboardingStep,
  OnboardingStepState
} from '@/features/setup-layout/types'
import { map } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { onboardingStepsService } from '../onboarding-steps'

describe('onboardingStepsService', () => {
  it('marks earlier steps done and later ones upcoming', () => {
    expect(
      map(
        onboardingStepsService.toStepViews(OnboardingStep.HARDWARE, false),
        'state'
      )
    ).toEqual([
      OnboardingStepState.DONE,
      OnboardingStepState.CURRENT,
      OnboardingStepState.UPCOMING
    ])
  })

  it('marks the current step failed', () => {
    expect(
      onboardingStepsService.toStepViews(OnboardingStep.BACKEND, true)[0].state
    ).toBe(OnboardingStepState.FAILED)
  })
})
