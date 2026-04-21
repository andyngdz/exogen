import { HistoryItem } from '@/types'
import { FC } from 'react'
import { HistoryItemContainer } from './HistoryItemContainer'

interface HistoryGroupProps {
  histories: HistoryItem[]
}

export const HistoryGroup: FC<HistoryGroupProps> = ({ histories }) => {
  return (
    <div className="flex flex-col flex-1 gap-4">
      {histories.map((history) => {
        return <HistoryItemContainer key={history.id} history={history} />
      })}
    </div>
  )
}
