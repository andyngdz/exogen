'use client'

import { Chip } from '@heroui/react'
import { modelTagService } from '@/features/model-recommendations/services/model_tag'
import { map } from 'es-toolkit/compat'
import { FC } from 'react'

interface ModelRecommendationsTagsProps {
  tags: string[]
}

export const ModelRecommendationsTags: FC<ModelRecommendationsTagsProps> = ({
  tags
}) => {
  return (
    <section className="flex flex-wrap gap-2">
      {map(tags, (tag, tagPosition) => (
        <Chip
          key={tag}
          color={modelTagService.getChipColor(tagPosition)}
          variant="primary"
          className="font-medium text-xs"
        >
          {tag}
        </Chip>
      ))}
    </section>
  )
}
