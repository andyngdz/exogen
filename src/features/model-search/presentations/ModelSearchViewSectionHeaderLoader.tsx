import { Skeleton } from '@heroui/react'
import { FC } from 'react'

interface ModelSearchViewSectionHeaderLoaderProps {
  showLink?: boolean
}

export const ModelSearchViewSectionHeaderLoader: FC<
  ModelSearchViewSectionHeaderLoaderProps
> = ({ showLink = false }) => {
  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      {showLink && <Skeleton className="h-6 w-6 rounded-full" />}
    </div>
  )
}
