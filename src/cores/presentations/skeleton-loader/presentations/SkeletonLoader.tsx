'use client'

import { AnimatePresence } from 'framer-motion'
import { useMemo, type ReactNode } from 'react'
import { SkeletonFadeBlock } from './SkeletonFadeBlock'

interface SkeletonLoaderProps<T> {
  isLoading: boolean
  skeleton: ReactNode
  data?: T
  children: (data: T) => ReactNode
}

export const SkeletonLoader = <T,>({
  isLoading,
  skeleton,
  data,
  children
}: SkeletonLoaderProps<T>) => {
  const render = useMemo(() => {
    if (isLoading) {
      return (
        <SkeletonFadeBlock animationKey="skeleton">
          {skeleton}
        </SkeletonFadeBlock>
      )
    }

    if (data) {
      return (
        <SkeletonFadeBlock animationKey="content">
          {children(data)}
        </SkeletonFadeBlock>
      )
    }
  }, [isLoading, skeleton, data, children])

  return <AnimatePresence mode="wait">{render}</AnimatePresence>
}
