'use client'

import AIAnimationData from '@/assets/ai.json'
import clsx from 'clsx'
import { FC } from 'react'
import Lottie from 'react-lottie'

export interface FullScreenLoaderProps {
  message: string
}

export const FullScreenLoader: FC<FullScreenLoaderProps> = ({ message }) => {
  return (
    <div
      className={clsx(
        'absolute inset-0 z-10',
        'backdrop-blur-md bg-background/90'
      )}
    >
      <div
        className={clsx(
          'flex flex-col gap-2 items-center justify-center',
          'h-full w-full'
        )}
      >
        <Lottie
          options={{ animationData: AIAnimationData }}
          width={48}
          height={48}
        />
        <span className="text-xs font-medium text-foreground animate-pulse">
          {message}
        </span>
      </div>
    </div>
  )
}
