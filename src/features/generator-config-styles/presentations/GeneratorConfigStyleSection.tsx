'use client'

import { StyleSection } from '@/types'
import { Card, CardBody, CardHeader, ScrollShadow } from '@heroui/react'
import { FC } from 'react'
import { useGeneratorConfigStyleSection } from '../states/useGeneratorConfigStyleSection'
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
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
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
              <Card shadow="sm">
                <CardHeader className="text-lg font-medium capitalize">
                  {styleSection.id}
                </CardHeader>
                <CardBody>
                  <div className="flex flex-wrap gap-2">
                    {styleSection.styles.map((styleItem) => (
                      <GeneratorConfigStyleItem
                        key={styleItem.id}
                        styleItem={styleItem}
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )
        })}
      </div>
    </ScrollShadow>
  )
}
