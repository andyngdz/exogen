import { ModelWithAvatar } from '@/cores/presentations/ModelWithAvatar'
import { useModelSearchItem } from '@/features/model-search/states/useModelSearchItem'
import { formatter } from '@/services'
import { ModelSearchInfo } from '@/types'
import { Card } from '@heroui/react'
import clsx from 'clsx'
import { CircleArrowDown, Heart } from 'lucide-react'
import { FC } from 'react'

export interface ModelSearchItemProps {
  modelSearchInfo: ModelSearchInfo
}

export const ModelSearchItem: FC<ModelSearchItemProps> = ({
  modelSearchInfo
}) => {
  const { id, author, downloads, likes } = modelSearchInfo
  const { isSelected, pressProps } = useModelSearchItem(id)

  return (
    <Card
      {...pressProps}
      role="button"
      tabIndex={0}
      className={clsx('cursor-pointer', {
        'bg-surface-secondary': !isSelected,
        'bg-surface-tertiary': isSelected
      })}
    >
      <Card.Header>
        <ModelWithAvatar author={author} id={id} />
      </Card.Header>
      <Card.Content>
        <div className="flex gap-4 text-foreground">
          <div className="flex items-center gap-2">
            <CircleArrowDown size={16} />
            <span className="text-xs">{formatter.number(downloads)}</span>
          </div>
          <span className="flex items-center gap-2">
            <Heart size={16} />
            <span className="text-xs">{formatter.number(likes)}</span>
          </span>
        </div>
      </Card.Content>
    </Card>
  )
}
