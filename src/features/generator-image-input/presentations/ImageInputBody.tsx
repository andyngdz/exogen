'use client'

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
        <img
          src={initImageBase64}
          alt="Input"
          className="h-full w-full object-cover"
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
