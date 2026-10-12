'use client'

import { StyleSection } from '@/types'
import { map } from 'es-toolkit/compat'
import { FC } from 'react'
import { GeneratorConfigStyleItem } from './GeneratorConfigStyleItem'

interface GeneratorConfigStyleSectionProps {
  styleSections: StyleSection[]
}

/** Every style section as a labeled group of chips. */
export const GeneratorConfigStyleSection: FC<
  GeneratorConfigStyleSectionProps
> = ({ styleSections }) => {
  return (
    <div className="flex flex-col gap-4">
      {map(styleSections, (styleSection) => (
        <div
          key={styleSection.id}
          role="group"
          aria-label={styleSection.id}
          className="flex flex-col gap-2"
        >
          <span className="text-xs text-muted capitalize">
            {styleSection.id}
          </span>
          <div className="flex flex-wrap gap-2">
            {map(styleSection.styles, (styleItem) => (
              <GeneratorConfigStyleItem
                key={styleItem.id}
                styleItem={styleItem}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
