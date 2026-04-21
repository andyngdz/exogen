import { useModelSearchView } from '../states/useModelSearchView'

import { SkeletonLoader } from '@/cores/presentations'
import { useDownloadWatcher } from '@/features/download-watcher'
import { ModelDownloadStatusLine } from '@/features/model-download-status-line'
import { ScrollShadow } from '@heroui/react'
import { useModelSearchSelectorStore } from '../states'
import { ModelSearchViewCard } from './ModelSearchViewCard'
import { ModelSearchViewFiles } from './ModelSearchViewFiles'
import { ModelSearchViewFooter } from './ModelSearchViewFooter'
import { ModelSearchViewLoader } from './ModelSearchViewLoader'
import { ModelSearchViewSpaces } from './ModelSearchViewSpaces'

export const ModelSearchView = () => {
  const { model_id } = useModelSearchSelectorStore()
  const { modelDetails, isLoading } = useModelSearchView(model_id)
  const { isDownloading } = useDownloadWatcher(model_id)

  return (
    <SkeletonLoader
      isLoading={isLoading}
      data={modelDetails}
      skeleton={<ModelSearchViewLoader />}
    >
      {(details) => (
        <div className="flex flex-col gap-2 h-full">
          <ScrollShadow className="flex flex-col gap-8 p-4 flex-1">
            <ModelSearchViewCard
              author={details.author}
              downloads={details.downloads}
              id={details.id}
              likes={details.likes}
              tags={details.tags}
            />
            <ModelSearchViewSpaces spaces={details.spaces} />
            <ModelSearchViewFiles id={details.id} siblings={details.siblings} />
          </ScrollShadow>
          <div className="flex flex-col">
            {isDownloading && <ModelDownloadStatusLine id={details.id} />}
            <ModelSearchViewFooter id={details.id} />
          </div>
        </div>
      )}
    </SkeletonLoader>
  )
}
