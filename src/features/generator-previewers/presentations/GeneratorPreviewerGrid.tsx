'use client'

import { ScrollShadow } from '@heroui/react'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useGeneratorPreviewer } from '../states'
import { GeneratorPreviewerItem } from './GeneratorPreviewerItem'

export const GeneratorPreviewerGrid = () => {
  const { imageStepEnds } = useGeneratorPreviewer()

  const ImageComponents = useMemo(() => {
    return imageStepEnds.map((imageStepEnd) => {
      return (
        <GeneratorPreviewerItem
          key={imageStepEnd.index}
          imageStepEnd={imageStepEnd}
        />
      )
    })
  }, [imageStepEnds])

  return (
    <ScrollShadow className="h-full">
      <div
        data-testid="grid-container"
        className={clsx(
          'grid grid-cols-[repeat(auto-fill,minmax(256px,1fr))]',
          'gap-4 p-4'
        )}
      >
        {ImageComponents}
      </div>
    </ScrollShadow>
  )
}
