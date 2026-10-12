import { onboardingStepsService } from '@/features/setup-layout/services/onboarding-steps'
import {
  OnboardingStep,
  OnboardingStepState
} from '@/features/setup-layout/types'
import clsx from 'clsx'
import { map } from 'es-toolkit/compat'
import { Check, X } from 'lucide-react'
import { FC, Fragment } from 'react'

interface OnboardingStepperProps {
  step: OnboardingStep
  isFailed: boolean
}

/** Backend, Hardware, Model: done steps checked, the current one filled, a failure crossed. */
export const OnboardingStepper: FC<OnboardingStepperProps> = ({
  step,
  isFailed
}) => {
  const steps = onboardingStepsService.toStepViews(step, isFailed)

  return (
    <ol aria-label="Setup steps" className="flex items-center gap-2">
      {map(steps, (view, index) => {
        const isDone = view.state === OnboardingStepState.DONE
        const isCurrent = view.state === OnboardingStepState.CURRENT
        const isFailedStep = view.state === OnboardingStepState.FAILED

        return (
          <Fragment key={view.step}>
            {index > 0 && <li aria-hidden className="h-px w-10 bg-border" />}
            <li
              {...((isCurrent || isFailedStep) && {
                'aria-current': 'step' as const
              })}
              className={clsx(
                'flex items-center gap-2 text-sm font-medium whitespace-nowrap',
                { 'text-muted': !isCurrent && !isFailedStep }
              )}
            >
              <span
                className={clsx(
                  'flex size-6 items-center justify-center rounded-full text-xs',
                  {
                    'ring-1 ring-border':
                      view.state === OnboardingStepState.UPCOMING,
                    'bg-success-soft text-success-soft-foreground': isDone,
                    'bg-accent text-accent-foreground': isCurrent,
                    'bg-danger text-danger-foreground': isFailedStep
                  }
                )}
              >
                {isDone && <Check size={12} />}
                {isFailedStep && <X size={12} />}
                {!isDone && !isFailedStep && view.number}
              </span>
              {view.label}
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
