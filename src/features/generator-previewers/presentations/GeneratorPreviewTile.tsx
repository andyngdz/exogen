'use client'

import clsx from 'clsx'
import { CSSProperties, ReactNode } from 'react'

interface GeneratorPreviewTileProps {
  aspectRatio?: number
  className?: string
  children: ReactNode
  topRight?: ReactNode
  topRightClassName?: string
  bottomOverlay?: ReactNode
  bottomOverlayClassName?: string
}

export const GeneratorPreviewTile = ({
  aspectRatio,
  className,
  children,
  topRight,
  topRightClassName,
  bottomOverlay,
  bottomOverlayClassName
}: GeneratorPreviewTileProps) => {
  const style: CSSProperties | undefined = aspectRatio
    ? {
        aspectRatio
      }
    : undefined

  return (
    <div
      className={clsx(
        'relative group h-full w-full overflow-hidden rounded-2xl bg-content1',
        className
      )}
      style={style}
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
