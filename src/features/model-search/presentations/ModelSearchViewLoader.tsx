import { ScrollShadow, Skeleton } from '@heroui/react'

const SectionHeaderSkeleton = ({
  showLink = false
}: {
  showLink?: boolean
}) => {
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

const METRIC_SKELETON_ITEMS = Array.from({ length: 3 }).map(
  (_, idx) => `metric-skeleton-${idx}`
)
const TAG_SKELETON_ITEMS = Array.from({ length: 10 }).map(
  (_, idx) => `tag-skeleton-${idx}`
)
const SPACE_SKELETON_ITEMS = Array.from({ length: 6 }).map(
  (_, idx) => `space-skeleton-${idx}`
)
const FILE_SKELETON_ITEMS = Array.from({ length: 6 }).map(
  (_, idx) => `file-skeleton-${idx}`
)

const ModelSearchViewCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeaderSkeleton showLink />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-default-700">
          {METRIC_SKELETON_ITEMS.map((key) => (
            <div className="flex items-center gap-2" key={key}>
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
        <ScrollShadow
          orientation="horizontal"
          hideScrollBar
          className="flex gap-2"
        >
          {TAG_SKELETON_ITEMS.map((key) => (
            <Skeleton className="h-6 w-24 rounded-full" key={key} />
          ))}
        </ScrollShadow>
      </div>
    </div>
  )
}

const ModelSearchViewSpacesSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeaderSkeleton />
      <div className="flex flex-wrap gap-2">
        {SPACE_SKELETON_ITEMS.map((key) => (
          <Skeleton className="h-8 w-32 rounded-full" key={key} />
        ))}
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    </div>
  )
}

const ModelSearchViewFilesSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeaderSkeleton showLink />
      <div className="rounded-lg border border-default overflow-hidden">
        <div className="grid grid-cols-2 gap-4 border-b border-default bg-default-50/20 p-3">
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>
        {FILE_SKELETON_ITEMS.map((key) => (
          <div
            key={key}
            className="grid grid-cols-2 gap-4 border-b border-default p-3 last:border-b-0"
          >
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

const ModelSearchViewFooterSkeleton = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded" />
      </div>
    </div>
  )
}

export const ModelSearchViewLoader = () => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <ScrollShadow className="flex flex-col gap-8 p-4 flex-1">
        <ModelSearchViewCardSkeleton />
        <ModelSearchViewSpacesSkeleton />
        <ModelSearchViewFilesSkeleton />
      </ScrollShadow>
      <div className="flex flex-col">
        <ModelSearchViewFooterSkeleton />
      </div>
    </div>
  )
}
