import { Skeleton } from '@heroui/react'
import { map, times } from 'es-toolkit/compat'
import { ModelSearchViewSectionHeaderLoader } from './ModelSearchViewSectionHeaderLoader'

const SPACE_LOADER_KEYS = times(6, (spaceNumber) => `space-${spaceNumber}`)

export const ModelSearchViewSpacesLoader = () => {
  return (
    <div className="flex flex-col gap-6">
      <ModelSearchViewSectionHeaderLoader />
      <div className="flex flex-wrap gap-2">
        {map(SPACE_LOADER_KEYS, (spaceKey) => (
          <Skeleton className="h-8 w-32 rounded-full" key={spaceKey} />
        ))}
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    </div>
  )
}
