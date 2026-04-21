'use client'

import { Progress } from '@heroui/react'
import { Activity } from 'react'
import { useModelLoadProgress } from '../states'

export const ModelLoadProgressBar = () => {
  const { isLoading, percentage } = useModelLoadProgress()

  return (
    <Activity mode={isLoading ? 'visible' : 'hidden'}>
      <div className="w-full bg-default-100">
        <Progress
          size="sm"
          value={percentage}
          color="primary"
          className="max-w-full"
          aria-label="Model loading progress"
        />
      </div>
    </Activity>
  )
}
