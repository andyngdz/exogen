import { StyleSection } from '@/types'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export const useGeneratorConfigStyleSection = (
  styleSections: StyleSection[]
) => {
  const parentRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: styleSections.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 2,
    measureElement: (element) => element.getBoundingClientRect().height
  })

  return {
    parentRef,
    rowVirtualizer
  }
}
