import clsx from 'clsx'
import { ModelSearchListModel } from './ModelSearchListModel'
import { ModelSearchView } from './ModelSearchView'

/** Search results on the left, the picked model's card and files on the right. */
export const ModelsHuggingFace = () => {
  return (
    <div className="flex min-h-0 flex-1">
      <div
        className={clsx(
          'flex w-105 shrink-0 flex-col',
          'border-r border-separator'
        )}
      >
        <ModelSearchListModel />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <ModelSearchView />
      </div>
    </div>
  )
}
