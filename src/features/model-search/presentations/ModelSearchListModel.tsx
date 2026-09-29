import { SkeletonLoader } from '@/cores/presentations'
import { useModelSearch } from '@/features/model-search/states'
import { Alert, ProgressBar, ScrollShadow } from '@heroui/react'
import { isEmpty, map } from 'es-toolkit/compat'
import { ModelSearchItem } from './ModelSearchItem'

export const ModelSearchListModel = () => {
  const { data, isLoading } = useModelSearch()

  if (isEmpty(data) && !isLoading) {
    return (
      <Alert className="grow-0">
        <Alert.Content>
          <Alert.Title>No models found</Alert.Title>
        </Alert.Content>
      </Alert>
    )
  }

  return (
    <ScrollShadow>
      <SkeletonLoader
        isLoading={isLoading}
        data={data}
        skeleton={
          <ProgressBar
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
            size="sm"
          >
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        }
      >
        {(models) => (
          <div className="flex flex-col gap-2 p-2">
            {map(models, (model) => (
              <ModelSearchItem key={model.id} modelSearchInfo={model} />
            ))}
          </div>
        )}
      </SkeletonLoader>
    </ScrollShadow>
  )
}
