import { ModelWithAvatar } from '@/cores/presentations/ModelWithAvatar'
import { formatter } from '@/services'
import { ModelSearchInfo } from '@/types'
import { Card, CardBody, CardHeader } from '@heroui/react'
import clsx from 'clsx'
import { CircleArrowDown, Heart } from 'lucide-react'
import { FC } from 'react'
import { onUpdateModelId, useModelSearchSelectorStore } from '../states'
export interface ModelSearchItemProps {
  modelSearchInfo: ModelSearchInfo
}

export const ModelSearchItem: FC<ModelSearchItemProps> = ({
  modelSearchInfo
}) => {
  const { model_id } = useModelSearchSelectorStore()
  const { id, author, downloads, likes } = modelSearchInfo
  const isSelected = model_id === id

  return (
    <Card
      shadow="sm"
      className={clsx('bg-content2', {
        'bg-content3': isSelected
      })}
      onPress={() => onUpdateModelId(id)}
      isPressable
    >
      <CardHeader>
        <ModelWithAvatar author={author} id={id} />
      </CardHeader>
      <CardBody>
        <div className="flex gap-4 text-default-700">
          <div className="flex items-center gap-2">
            <CircleArrowDown size={16} />
            <span className="text-xs">{formatter.number(downloads)}</span>
          </div>
          <span className="flex items-center gap-2">
            <Heart size={16} />
            <span className="text-xs">{formatter.number(likes)}</span>
          </span>
        </div>
      </CardBody>
    </Card>
  )
}
