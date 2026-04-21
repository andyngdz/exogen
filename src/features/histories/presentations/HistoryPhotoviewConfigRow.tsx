import { Chip } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { FC, useMemo } from 'react'

interface HistoryPhotoviewConfigRowProps {
  label: string
  value: string | number | string[]
}

export const HistoryPhotoviewConfigRow: FC<HistoryPhotoviewConfigRowProps> = ({
  label,
  value
}) => {
  const renderValue = useMemo(() => {
    if (Array.isArray(value)) {
      if (isEmpty(value)) {
        return <span className="text-default-500">None</span>
      }

      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Chip key={`${item}-${index}`} size="sm" variant="flat">
              {item}
            </Chip>
          ))}
        </div>
      )
    }

    return <span className="text-default-700">{value}</span>
  }, [value])

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-default">
      <span className="text-default-500 font-medium text-sm flex-1">
        {label}
      </span>
      <div className="flex-1 flex justify-end text-sm">{renderValue}</div>
    </div>
  )
}
