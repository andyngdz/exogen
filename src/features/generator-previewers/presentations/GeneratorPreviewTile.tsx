'use client'

import { Card } from '@heroui/react'
import clsx from 'clsx'
import { ReactNode } from 'react'

interface GeneratorPreviewTileProps {
  aspectRatio?: number
  className?: string
  children: ReactNode
  topRight?: ReactNode
  topRightClassName?: string
  bottomOverlay?: ReactNode
  bottomOverlayClassName?: string
  onPress?: VoidFunction
  ariaLabel?: string
}

export const GeneratorPreviewTile = ({
  aspectRatio,
  className,
  children,
  topRight,
  topRightClassName,
  bottomOverlay,
  bottomOverlayClassName,
  onPress,
  ariaLabel
}: GeneratorPreviewTileProps) => {
  const isClickable = !!onPress

  return (
    <Card
      as="div"
      isPressable={isClickable}
      onPress={onPress}
      aria-label={ariaLabel ?? 'Open preview'}
      className={clsx(
        'relative group h-full w-full overflow-hidden rounded-2xl',
        className,
        {
          'cursor-zoom-in': isClickable
        }
      )}
      style={{
        aspectRatio
      }}
    >
      {children}
      {topRight && (
        <div
          className={clsx(
            'absolute top-2 right-2 z-20 pointer-events-auto',
            topRightClassName
          )}
        >
          {topRight}
        </div>
      )}
      {bottomOverlay && (
        <div
          className={clsx(
            'absolute bottom-3 left-3 right-3 z-20 pointer-events-auto',
            bottomOverlayClassName
          )}
        >
          {bottomOverlay}
        </div>
      )}
    </Card>
  )
}
