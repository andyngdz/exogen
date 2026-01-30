'use client'

interface ImageInputBottomOverlayProps {
  message: string
}

export const ImageInputBottomOverlay = ({
  message
}: ImageInputBottomOverlayProps) => {
  return (
    <div className="text-xs text-red-500 bg-background/80 backdrop-blur-sm rounded-medium px-3 py-2">
      {message}
    </div>
  )
}
