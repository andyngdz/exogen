'use client'

import { BreadcrumbItem, Breadcrumbs } from '@heroui/react'
import clsx from 'clsx'
import { useGenerationPhase } from '../states'
import { GenerationPhaseIndicator } from './GenerationPhaseIndicator'

export const GenerationPhaseStepper = () => {
  const { steps, current, isVisible } = useGenerationPhase()

  if (!isVisible) return null

  return (
    <div className="fixed bottom-1/12 left-1/2 -translate-x-1/2 z-50">
      <Breadcrumbs
        className={clsx(
          'bg-background/90 backdrop-blur-md',
          'border border-default',
          'px-4 py-2',
          'rounded-full'
        )}
      >
        {steps.map((step) => {
          const isCurrent = step.phase === current

          return (
            <BreadcrumbItem
              key={step.phase}
              startContent={isCurrent && <GenerationPhaseIndicator />}
              isCurrent={isCurrent}
              classNames={{
                item: 'text-xs'
              }}
            >
              {step.label}
            </BreadcrumbItem>
          )
        })}
      </Breadcrumbs>
    </div>
  )
}
