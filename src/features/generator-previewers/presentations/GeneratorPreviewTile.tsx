'use client'

import clsx from 'clsx'
import { KeyboardEvent, ReactNode, useCallback } from 'react'

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

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onPress) return
      if (event.key !== 'Enter' && event.key !== ' ') return

      event.preventDefault()
      onPress()
    },
    [onPress]
  )

  return (
    <div
      className={clsx(
        'relative group h-full w-full overflow-hidden rounded-2xl bg-content1',
        className,
        {
          'cursor-zoom-in': isClickable
        }
      )}
      style={{
        aspectRatio
      }}
      onClick={onPress}
      onKeyDown={onKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
    >
      {children}
      {topRight && (
        <div className={clsx('absolute top-2 right-2', topRightClassName)}>
          {topRight}
        </div>
      )}
      {bottomOverlay && (
        <div
          className={clsx(
            'absolute bottom-3 left-3 right-3',
            bottomOverlayClassName
          )}
        >
          {bottomOverlay}
        </div>
      )}
    </div>
  )
}
