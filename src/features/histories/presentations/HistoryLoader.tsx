import { ScrollShadow, Skeleton } from '@heroui/react'

const SKELETON_ITEMS = Array.from({ length: 10 }).map(
  (_, idx) => `skeleton-item-${idx}`
)

export const HistoryLoader = () => {
  return (
    <div className="flex flex-col" data-testid="history-loader">
      <ScrollShadow>
        <div className="flex flex-col flex-1 divide-y divide-default">
          {SKELETON_ITEMS.map((id) => (
            <div
              key={id}
              data-testid="history-loader-item"
              className="flex flex-col gap-2 py-6 px-2"
            >
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollShadow>
    </div>
  )
}
