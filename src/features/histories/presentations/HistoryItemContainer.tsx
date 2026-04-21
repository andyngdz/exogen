'use client'

import { useBackendUrl } from '@/cores/backend-initialization'
import { dateFormatter } from '@/services'
import { HistoryItem } from '@/types'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/react'
import Image from 'next/image'
import { FC } from 'react'
import { useHistoryPhotoviewStore } from '../states/useHistoryPhotoviewStore'
import { HistoryUseConfigButton } from './HistoryUseConfigButton'

interface HistoryItemProps {
  history: HistoryItem
}

export const HistoryItemContainer: FC<HistoryItemProps> = ({ history }) => {
  const baseURL = useBackendUrl()
  const { openPhotoview } = useHistoryPhotoviewStore()

  const formattedTime = dateFormatter.time(`${history.created_at}Z`)
  const ariaLabel = `View details for ${history.model} generated at ${formattedTime}`

  return (
    <Card
      isPressable
      onPress={() => openPhotoview(history.id)}
      aria-label={ariaLabel}
      shadow="none"
      className="bg-content2"
      as="div"
    >
      <CardHeader className="flex items-center justify-between gap-2">
        <span className="text-default-700 font-bold text-sm">
          {formattedTime}
        </span>
        <HistoryUseConfigButton history={history} />
      </CardHeader>
      <CardBody className="flex flex-col gap-1 py-2">
        <span className="text-default-700 font-semibold text-sm truncate">
          {history.model}
        </span>
        <span className="text-sm truncate">{history.prompt}</span>
      </CardBody>
      {history.generated_images.length > 0 && (
        <CardFooter className="flex flex-wrap gap-2">
          {history.generated_images.map((image, index) => (
            <div
              key={`${image.file_name}-${index}`}
              className="relative w-12 h-12 overflow-hidden rounded-md"
            >
              <Image
                src={`${baseURL}/${image.path}`}
                alt={`Generated image ${index + 1}`}
                className="object-cover"
                sizes="48px"
                fill
              />
            </div>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}
