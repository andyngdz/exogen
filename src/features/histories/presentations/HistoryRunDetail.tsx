import { useHistoryRunDetail } from '@/features/histories/states/useHistoryRunDetail'
import { HistoryItem } from '@/types'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { map } from 'es-toolkit/compat'
import { ChevronLeft, ChevronRight, Download, RotateCcw } from 'lucide-react'
import NextImage from 'next/image'
import { FC } from 'react'
import { HistoryConfigValue } from './HistoryConfigValue'
import { HistoryDeleteButton } from './HistoryDeleteButton'

interface HistoryRunDetailProps {
  history: HistoryItem
}

/** The selected run: its images, full config and the actions on it. */
export const HistoryRunDetail: FC<HistoryRunDetailProps> = ({ history }) => {
  const detail = useHistoryRunDetail(history)

  return (
    <aside
      aria-label="Selected run"
      className={clsx(
        'flex w-90 shrink-0 flex-col gap-4',
        'border-l border-separator'
      )}
    >
      <div className="flex flex-col gap-2 px-4 pt-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
          {detail.imageUrl && (
            <NextImage
              src={detail.imageUrl}
              alt={history.prompt}
              fill
              sizes="360px"
              className="object-cover"
            />
          )}
        </div>
        {detail.canStep && (
          <div className="flex items-center justify-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="Previous image"
              onPress={detail.onPrevious}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="font-mono text-xs text-muted">
              {detail.positionLabel}
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="Next image"
              onPress={detail.onNext}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
      <dl
        className={clsx(
          'flex min-h-0 flex-1 flex-col',
          'gap-2 overflow-y-auto px-4 text-sm'
        )}
      >
        {map(detail.configRows, (row) => (
          <div key={row.label} className="flex gap-4">
            <dt className="w-28 shrink-0 text-muted">{row.label}</dt>
            <dd className="min-w-0 flex-1">
              <HistoryConfigValue row={row} />
            </dd>
          </div>
        ))}
      </dl>
      <div
        className={clsx(
          'flex items-center gap-2 border-t',
          'border-separator px-4 py-4'
        )}
      >
        <Button
          variant="primary"
          className="flex-1"
          onPress={detail.onUseConfig}
        >
          <RotateCcw size={16} />
          Use this config
        </Button>
        <Button
          isIconOnly
          variant="secondary"
          aria-label="Download image"
          onPress={detail.onDownload}
        >
          <Download size={16} />
        </Button>
        <HistoryDeleteButton history={history} />
      </div>
    </aside>
  )
}
