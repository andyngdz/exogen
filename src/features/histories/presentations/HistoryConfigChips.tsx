import { Chip } from '@heroui/react'
import { isEmpty, map } from 'es-toolkit/compat'
import { FC } from 'react'

interface HistoryConfigChipsProps {
  values: string[]
}

/** A list setting such as styles or LoRAs; None when the run used none. */
export const HistoryConfigChips: FC<HistoryConfigChipsProps> = ({ values }) => {
  if (isEmpty(values)) return <span className="text-muted">None</span>

  return (
    <span className="flex flex-wrap gap-1">
      {map(values, (value) => (
        <Chip key={value} size="sm" variant="soft">
          {value}
        </Chip>
      ))}
    </span>
  )
}
