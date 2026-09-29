import { Skeleton } from '@heroui/react'

export const ModelSearchViewFooterLoader = () => {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-48 rounded" />
      </div>
      <Skeleton className="h-10 w-32 rounded" />
    </div>
  )
}
