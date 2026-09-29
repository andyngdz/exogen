import { Chip } from '@heroui/react'
import { isEmpty, map } from 'es-toolkit/compat'
import { FC } from 'react'

interface HistoryPhotoviewConfigListProps {
  items: string[]
}

export const HistoryPhotoviewConfigList: FC<
  HistoryPhotoviewConfigListProps
> = ({ items }) => {
  if (isEmpty(items)) {
    return <span className="text-muted">None</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {map(items, (item) => (
        <Chip key={item} size="sm" variant="soft">
          {item}
        </Chip>
      ))}
    </div>
  )
}
