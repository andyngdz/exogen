import { Skeleton } from '@heroui/react'
import clsx from 'clsx'
import { map, times } from 'es-toolkit/compat'
import { ModelSearchViewSectionHeaderLoader } from './ModelSearchViewSectionHeaderLoader'

const FILE_LOADER_KEYS = times(6, (fileNumber) => `file-${fileNumber}`)

export const ModelSearchViewFilesLoader = () => {
  return (
    <div className="flex flex-col gap-6">
      <ModelSearchViewSectionHeaderLoader showLink />
      <div className="rounded-lg border border-border overflow-hidden">
        <div
          className={clsx(
            'flex items-center justify-between gap-4',
            'border-b border-border bg-default/20 p-4'
          )}
        >
          <Skeleton className="h-4 w-1/4 rounded" />
          <Skeleton className="h-4 w-1/8 rounded" />
        </div>
        {map(FILE_LOADER_KEYS, (fileKey) => (
          <div
            key={fileKey}
            className={clsx(
              'flex items-center justify-between gap-4',
              'border-b border-border p-4 last:border-b-0'
            )}
          >
            <Skeleton className="h-3 w-3/8 rounded" />
            <Skeleton className="h-3 w-1/8 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
