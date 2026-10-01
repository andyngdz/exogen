'use client'

import ExoGenLogo from '@/assets/logo.png'
import { AppStatusBar } from '@/features/app-shell/presentations/AppStatusBar'
import { useOnboardingLayout } from '@/features/setup-layout/states/useOnboardingLayout'
import { OnboardingStep, OnboardingWidth } from '@/features/setup-layout/types'
import clsx from 'clsx'
import NextImage from 'next/image'
import { FC, ReactNode } from 'react'
import { OnboardingStepper } from './OnboardingStepper'

interface OnboardingLayoutProps {
  step: OnboardingStep
  isStepFailed?: boolean
  width?: OnboardingWidth
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
}

/** The setup screens' frame, per frames 3d to 2g: stepper, one column, actions, status bar. */
export const OnboardingLayout: FC<OnboardingLayoutProps> = ({
  step,
  isStepFailed = false,
  width = OnboardingWidth.NARROW,
  title,
  description,
  footer,
  children
}) => {
  useOnboardingLayout()
  const columnWidth = width === OnboardingWidth.WIDE ? 'w-220' : 'w-160'

  return (
    <div className="flex h-full w-full flex-col gap-0">
      <header
        className={clsx(
          'flex h-16 shrink-0 items-center',
          'justify-between gap-4 px-6',
          'border-b border-separator'
        )}
      >
        <div className="flex w-50 items-center gap-2">
          <NextImage src={ExoGenLogo} alt="" width={28} height={28} />
          <span className="font-semibold">ExoGen</span>
        </div>
        <OnboardingStepper step={step} isFailed={isStepFailed} />
        <div className="w-50" />
      </header>
      <main
        className={clsx(
          'flex min-h-0 flex-1 justify-center',
          'overflow-y-auto px-6 pt-8'
        )}
      >
        <div
          className={clsx('flex max-w-full flex-col gap-6 pb-6', columnWidth)}
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted">{description}</p>
          </div>
          {children}
        </div>
      </main>
      <div className="flex h-18 shrink-0 items-center justify-center px-6">
        <div
          className={clsx(
            'flex max-w-full items-center justify-between gap-2',
            columnWidth
          )}
        >
          {footer}
        </div>
      </div>
      <AppStatusBar />
    </div>
  )
}
