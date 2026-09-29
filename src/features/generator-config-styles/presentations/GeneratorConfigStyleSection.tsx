'use client'

import { useGeneratorConfigStyleSection } from '@/features/generator-config-styles/states/useGeneratorConfigStyleSection'
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
  const { parentRef, rowVirtualizer } =
    useGeneratorConfigStyleSection(styleSections)

  return (
    <ScrollShadow ref={parentRef} className="h-full p-2">
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {map(rowVirtualizer.getVirtualItems(), (virtualItem) => {
          const styleSection = styleSections[virtualItem.index]

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              className="absolute w-full pb-4"
              style={{
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <Card variant="secondary">
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
            </div>
          )
        })}
      </div>
    </ScrollShadow>
  )
}
