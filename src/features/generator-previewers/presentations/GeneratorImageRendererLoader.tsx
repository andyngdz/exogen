import { Skeleton } from '@heroui/react'

/** Placeholder for an image still generating; fills the tile like the image's `fill` does. */
export const GeneratorImageRendererLoader = () => {
  return <Skeleton className="absolute inset-0 rounded-2xl" />
}
