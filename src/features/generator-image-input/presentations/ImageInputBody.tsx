'use client'

import { Image } from '@heroui/react'

interface ImageInputBodyProps {
  hasImage: boolean
  initImageBase64?: string
}

export const ImageInputBody = ({
  hasImage,
  initImageBase64
}: ImageInputBodyProps) => {
  return (
    <div className="h-full w-full">
      {hasImage && initImageBase64 ? (
        <Image
          src={initImageBase64}
          alt="Input"
          removeWrapper
          classNames={{
            img: 'h-full w-full block object-cover'
          }}
        />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center text-sm text-default-500">
          <div className="text-default-600">Click to upload</div>
          <div className="mt-1">or drop an image</div>
          <div className="mt-3 text-xs text-default-500">
            Tip: paste from clipboard (Ctrl/Cmd+V)
          </div>
        </div>
      )}
    </div>
  )
}
