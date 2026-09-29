import { ScrollShadow } from '@heroui/react'
import { ModelSearchViewCardLoader } from './ModelSearchViewCardLoader'
import { ModelSearchViewFilesLoader } from './ModelSearchViewFilesLoader'
import { ModelSearchViewFooterLoader } from './ModelSearchViewFooterLoader'
import { ModelSearchViewSpacesLoader } from './ModelSearchViewSpacesLoader'

export const ModelSearchViewLoader = () => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <ScrollShadow className="flex-1">
        <div className="flex flex-col gap-8 p-4">
          <ModelSearchViewCardLoader />
          <ModelSearchViewSpacesLoader />
          <ModelSearchViewFilesLoader />
        </div>
      </ScrollShadow>
      <ModelSearchViewFooterLoader />
    </div>
  )
}
