import clsx from 'clsx'
import { isArray } from 'es-toolkit/compat'
import { FC, useMemo } from 'react'
import { HistoryPhotoviewConfigList } from './HistoryPhotoviewConfigList'

interface HistoryPhotoviewConfigRowProps {
  label: string
  value: string | number | string[]
}

export const HistoryPhotoviewConfigRow: FC<HistoryPhotoviewConfigRowProps> = ({
  label,
  value
}) => {
  const renderValue = useMemo(() => {
    if (isArray(value)) {
      return <HistoryPhotoviewConfigList items={value} />
    }

    return <span className="text-foreground">{value}</span>
  }, [value])

  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-4',
        'py-2 border-b border-border'
      )}
    >
      <span className="text-muted font-medium text-sm flex-1">{label}</span>
      <div className="flex-1 flex justify-end text-sm">{renderValue}</div>
    </div>
  )
}
