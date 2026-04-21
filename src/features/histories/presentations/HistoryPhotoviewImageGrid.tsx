'use client'

import { useBackendUrl } from '@/cores/backend-initialization'
import { HistoryGeneratedImage } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import Image from 'next/image'
import { FC } from 'react'

interface HistoryPhotoviewImageGridProps {
  images: HistoryGeneratedImage[]
}

export const HistoryPhotoviewImageGrid: FC<HistoryPhotoviewImageGridProps> = ({
  images
}) => {
  const baseURL = useBackendUrl()

  if (isEmpty(images)) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div
          key={`${image.file_name}-${index}`}
          className="relative aspect-square overflow-hidden rounded-lg"
        >
          <Image
            src={`${baseURL}/${image.path}`}
            alt={`Generated image ${index + 1}`}
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            fill
          />
        </div>
      ))}
    </div>
  )
}
