import {
  HistoryConfigRow,
  HistoryConfigRowKind
} from '@/features/histories/types'
import clsx from 'clsx'
import { FC } from 'react'
import { HistoryConfigChips } from './HistoryConfigChips'

interface HistoryConfigValueProps {
  row: HistoryConfigRow
}

/** A config value as text, monospace digits, or chips for list settings. */
export const HistoryConfigValue: FC<HistoryConfigValueProps> = ({ row }) => {
  if (row.kind === HistoryConfigRowKind.CHIPS) {
    return <HistoryConfigChips values={row.values} />
  }

  return (
    <span
      className={clsx({ 'font-mono': row.kind === HistoryConfigRowKind.MONO })}
    >
      {row.values.join(', ')}
    </span>
  )
}
