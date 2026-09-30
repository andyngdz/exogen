'use client'

import { StyleSection } from '@/types'
import { Card, ScrollShadow } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { FC } from 'react'
import { GeneratorConfigStyleItem } from './GeneratorConfigStyleItem'

interface GeneratorConfigStyleSectionProps {
  styleSections: StyleSection[]
}

export const GeneratorConfigStyleSection: FC<
  GeneratorConfigStyleSectionProps
> = ({ styleSections }) => {
  return (
    <ScrollShadow className="h-full p-2">
      <div className="flex flex-col gap-4">
        {map(styleSections, (styleSection) => (
          <Card key={styleSection.id} variant="secondary">
            <Card.Header className="text-lg font-medium capitalize">
              {styleSection.id}
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-2">
                {map(styleSection.styles, (styleItem) => (
                  <GeneratorConfigStyleItem
                    key={styleItem.id}
                    styleItem={styleItem}
                    color="accent"
                    variant="soft"
                  />
                ))}
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </ScrollShadow>
  )
}
