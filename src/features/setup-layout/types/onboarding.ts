export enum OnboardingStep {
  BACKEND = 'backend',
  HARDWARE = 'hardware',
  MODEL = 'model'
}

export enum OnboardingStepState {
  DONE = 'done',
  CURRENT = 'current',
  FAILED = 'failed',
  UPCOMING = 'upcoming'
}

export enum OnboardingWidth {
  NARROW = 'narrow',
  WIDE = 'wide'
}

export interface OnboardingStepView {
  step: OnboardingStep
  number: number
  label: string
  state: OnboardingStepState
}
