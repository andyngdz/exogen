'use client'

import { useGenerationPhase } from '@/features/generation-phase-stepper/states'
import { Breadcrumbs } from '@heroui/react'
import clsx from 'clsx'
import { map } from 'es-toolkit/compat'
import { GenerationPhaseIndicator } from './GenerationPhaseIndicator'

export const GenerationPhaseStepper = () => {
  const { steps, current, isVisible } = useGenerationPhase()

  if (!isVisible) return

  return (
    <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2">
      <Breadcrumbs
        className={clsx(
          'bg-background/90 backdrop-blur-md',
          'border border-border',
          'px-4 py-2',
          'rounded-full'
        )}
      >
        {map(steps, (step) => {
          const isCurrent = step.phase === current

          // v3 marks only the last breadcrumb as current, but the running phase can be any step.
          return (
            <Breadcrumbs.Item
              key={step.phase}
              id={step.phase}
              {...(isCurrent && { 'aria-current': 'step' as const })}
              className={clsx('text-xs', {
                'text-foreground font-medium': isCurrent,
                'text-muted': !isCurrent
              })}
            >
              {isCurrent && <GenerationPhaseIndicator />}
              {step.label}
            </Breadcrumbs.Item>
          )
        })}
      </Breadcrumbs>
    </div>
  )
}
