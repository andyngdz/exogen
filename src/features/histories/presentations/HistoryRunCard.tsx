import { useBackendUrl } from '@/cores/backend-initialization'
import { historyViewService } from '@/features/histories/services/history-view'
import { HistoryItem } from '@/types'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { isEmpty, map, take } from 'es-toolkit/compat'
import NextImage from 'next/image'
import { FC } from 'react'

interface HistoryRunCardProps {
  history: HistoryItem
  isSelected: boolean
  onSelect: VoidFunction
}

/** A run in the History grid: up to four thumbnails, the prompt and a summary line. */
export const HistoryRunCard: FC<HistoryRunCardProps> = ({
  history,
  isSelected,
  onSelect
}) => {
  const baseURL = useBackendUrl()

  return (
    <Button
      variant="ghost"
      aria-pressed={isSelected}
      aria-label={history.prompt}
      onPress={onSelect}
      className={clsx(
        'flex h-auto w-56 flex-col',
        'items-stretch gap-2 p-2',
        'rounded-xl text-left',
        { 'bg-surface ring-1 ring-accent': isSelected }
      )}
    >
      {isEmpty(history.generated_images) && (
        <span
          className={clsx(
            'flex aspect-square items-center justify-center',
            'rounded-md bg-surface-secondary text-xs text-muted'
          )}
        >
          No images
        </span>
      )}
      <span className="flex flex-wrap gap-1">
        {map(take(history.generated_images, 4), (image) => (
          <span
            key={image.id}
            className="relative aspect-square w-[calc(50%-2px)] overflow-hidden rounded-md bg-surface-secondary"
          >
            <NextImage
              src={`${baseURL}/${image.path}`}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
            />
          </span>
        ))}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-xs">{history.prompt}</span>
        <span className="font-mono text-xs text-muted">
          {historyViewService.toRunMeta(history)}
        </span>
      </span>
    </Button>
  )
}
