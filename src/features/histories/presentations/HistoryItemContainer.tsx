'use client'

import { useBackendUrl } from '@/cores/backend-initialization'
import { useHistoryItemPress } from '@/features/histories/states/useHistoryItemPress'
import { dateFormatter } from '@/services'
import { HistoryItem } from '@/types'
import { Card } from '@heroui/react'
import { isEmpty, map } from 'es-toolkit/compat'
import Image from 'next/image'
import { FC } from 'react'
import { HistoryUseConfigButton } from './HistoryUseConfigButton'

interface HistoryItemProps {
  history: HistoryItem
}

export const HistoryItemContainer: FC<HistoryItemProps> = ({ history }) => {
  const baseURL = useBackendUrl()
  const pressProps = useHistoryItemPress(history.id)

  const formattedTime = dateFormatter.time(`${history.created_at}Z`)
  const ariaLabel = `View details for ${history.model} generated at ${formattedTime}`
  const hasImages = !isEmpty(history.generated_images)

  return (
    <Card
      {...pressProps}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className="bg-surface-secondary cursor-pointer"
    >
      <Card.Header className="flex flex-row items-center justify-between gap-2">
        <span className="text-foreground font-bold text-sm">
          {formattedTime}
        </span>
        <HistoryUseConfigButton history={history} />
      </Card.Header>
      <Card.Content className="flex flex-col gap-1 py-2">
        <span className="text-foreground font-semibold text-sm truncate">
          {history.model}
        </span>
        <span className="text-sm truncate">{history.prompt}</span>
      </Card.Content>
      {hasImages && (
        <Card.Footer className="flex flex-wrap gap-2">
          {map(history.generated_images, (image, index) => (
            <div
              key={`${image.file_name}-${index}`}
              className="relative w-12 h-12 overflow-hidden rounded-md"
            >
              <Image
                src={`${baseURL}/${image.path}`}
                alt={`Generated image ${index + 1}`}
                className="object-cover"
                sizes="48px"
                fill
              />
            </div>
          ))}
        </Card.Footer>
      )}
    </Card>
  )
}
