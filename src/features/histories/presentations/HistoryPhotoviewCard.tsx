'use client'

import { dateFormatter } from '@/services'
import clsx from 'clsx'
import { HistoryItem } from '@/types'
import { FC } from 'react'
import { HistoryDeleteButton } from './HistoryDeleteButton'
import { HistoryPhotoviewConfigRow } from './HistoryPhotoviewConfigRow'
import { HistoryPhotoviewImageGrid } from './HistoryPhotoviewImageGrid'
import { HistoryUseConfigButton } from './HistoryUseConfigButton'

interface HistoryPhotoviewCardProps {
  history: HistoryItem
}

export const HistoryPhotoviewCard: FC<HistoryPhotoviewCardProps> = ({
  history
}) => {
  return (
    <div
      className={clsx('flex flex-col gap-6 p-6', 'w-full max-w-4xl mx-auto')}
    >
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-foreground">
            {dateFormatter.datetime(`${history.created_at}Z`)}
          </h2>
          <p className="text-lg text-muted">{history.model}</p>
        </div>
        <div className="flex gap-4">
          <HistoryUseConfigButton history={history} />
          <HistoryDeleteButton history={history} />
        </div>
      </div>

      <HistoryPhotoviewImageGrid images={history.generated_images} />

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground">Configuration</h3>
        <div className="flex flex-col gap-1">
          <HistoryPhotoviewConfigRow
            label="Prompt"
            value={history.config.prompt}
          />
          <HistoryPhotoviewConfigRow
            label="Negative Prompt"
            value={history.config.negative_prompt || 'None'}
          />
          <HistoryPhotoviewConfigRow label="Model" value={history.model} />
          <HistoryPhotoviewConfigRow
            label="Width"
            value={history.config.width}
          />
          <HistoryPhotoviewConfigRow
            label="Height"
            value={history.config.height}
          />
          <HistoryPhotoviewConfigRow
            label="Steps"
            value={history.config.steps}
          />
          <HistoryPhotoviewConfigRow
            label="CFG Scale"
            value={history.config.cfg_scale}
          />
          <HistoryPhotoviewConfigRow
            label="Sampler"
            value={history.config.sampler}
          />
          <HistoryPhotoviewConfigRow
            label="Seed"
            value={history.config.seed === -1 ? 'Random' : history.config.seed}
          />
          <HistoryPhotoviewConfigRow
            label="Number of Images"
            value={history.config.number_of_images}
          />
          <HistoryPhotoviewConfigRow
            label="Hires Fix"
            value={history.config.hires_fix ? 'Yes' : 'No'}
          />
          <HistoryPhotoviewConfigRow
            label="Styles"
            value={history.config.styles}
          />
        </div>
      </div>
    </div>
  )
}
