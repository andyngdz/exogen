import { ScrollShadow, Skeleton } from '@heroui/react'
import { map, times } from 'es-toolkit/compat'

const SKELETON_ITEMS = times(
  10,
  (skeletonNumber) => `skeleton-item-${skeletonNumber}`
)

export const HistoryLoader = () => {
  return (
    <div className="flex flex-col" data-testid="history-loader">
      <ScrollShadow>
        <div className="flex flex-col flex-1 divide-y divide-separator">
          {map(SKELETON_ITEMS, (id) => (
            <div
              key={id}
              data-testid="history-loader-item"
              className="flex flex-col gap-2 py-6 px-2 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-5 w-4/5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </ScrollShadow>
    </div>
  )
}
