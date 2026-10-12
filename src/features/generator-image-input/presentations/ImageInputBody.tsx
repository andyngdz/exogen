'use client'

import NextImage from 'next/image'
import { useMemo } from 'react'
import { ImageInputPlaceholder } from './ImageInputPlaceholder'

interface ImageInputBodyProps {
  hasImage: boolean
  initImageBase64?: string
}

export const ImageInputBody = ({
  hasImage,
  initImageBase64
}: ImageInputBodyProps) => {
  const content = useMemo(() => {
    if (!hasImage || !initImageBase64) return <ImageInputPlaceholder />

    return (
      <NextImage
        src={initImageBase64}
        alt="Input"
        fill
        className="block object-cover"
      />
    )
  }, [hasImage, initImageBase64])

  return <div className="relative h-full w-full">{content}</div>
}
