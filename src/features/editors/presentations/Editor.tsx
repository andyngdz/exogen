'use client'

import { Generator } from '@/features/generators'
import { ModelLoadProgressBar } from '@/features/model-load-progress'
import { ModelSelector } from '@/features/model-selectors/presentations/ModelSelector'

export const Editor = () => {
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex px-4 pt-2">
        <ModelSelector />
      </div>
      <ModelLoadProgressBar />
      <Generator />
    </div>
  )
}
