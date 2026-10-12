import { ScrollShadow, Skeleton } from '@heroui/react'
import { map, times } from 'es-toolkit/compat'
import { ModelSearchViewSectionHeaderLoader } from './ModelSearchViewSectionHeaderLoader'

const METRIC_LOADER_KEYS = times(3, (metricNumber) => `metric-${metricNumber}`)
const TAG_LOADER_KEYS = times(10, (tagNumber) => `tag-${tagNumber}`)

export const ModelSearchViewCardLoader = () => {
  return (
    <div className="flex flex-col gap-6">
      <ModelSearchViewSectionHeaderLoader showLink />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-foreground">
          {map(METRIC_LOADER_KEYS, (metricKey) => (
            <div className="flex items-center gap-2" key={metricKey}>
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
        <ScrollShadow orientation="horizontal" className="scrollbar-none">
          <div className="flex gap-2">
            {map(TAG_LOADER_KEYS, (tagKey) => (
              <Skeleton className="h-6 w-24 rounded-full" key={tagKey} />
            ))}
          </div>
        </ScrollShadow>
      </div>
    </div>
  )
}
