import { SkeletonLoader } from '@/cores/presentations'
import { Alert, Progress, ScrollShadow } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { useModelSearch } from '../states'
import { ModelSearchItem } from './ModelSearchItem'

export const ModelSearchListModel = () => {
  const { data, isLoading } = useModelSearch()

  if (isEmpty(data) && !isLoading) {
    return (
      <Alert className="grow-0">
        <span className="text-default">No models found</span>
      </Alert>
    )
  }

  return (
    <ScrollShadow>
      <SkeletonLoader
        isLoading={isLoading}
        data={data}
        skeleton={
          <Progress
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
            size="sm"
          />
        }
      >
        {(models) => (
          <div className="flex flex-col gap-2 p-2">
            {models.map((model) => (
              <ModelSearchItem key={model.id} modelSearchInfo={model} />
            ))}
          </div>
        )}
      </SkeletonLoader>
    </ScrollShadow>
  )
}
