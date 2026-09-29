'use client'

import { useModelLoadProgress } from '@/features/model-load-progress/states'
import { ProgressBar } from '@heroui/react'
import { Activity } from 'react'

export const ModelLoadProgressBar = () => {
  const { isLoading, percentage } = useModelLoadProgress()

  return (
    <Activity mode={isLoading ? 'visible' : 'hidden'}>
      <div className="w-full bg-default">
        <ProgressBar
          size="sm"
          value={percentage}
          className="max-w-full"
          aria-label="Model loading progress"
        >
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
    </Activity>
  )
}
