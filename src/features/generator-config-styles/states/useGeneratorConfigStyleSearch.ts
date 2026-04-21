import { StyleSection } from '@/types'
import { useDebounce } from '@uidotdev/usehooks'
import { isEmpty } from 'es-toolkit/compat'
import { useMemo, useState } from 'react'

export interface UseGeneratorConfigStyleSearchResult {
  query: string
  setQuery: (query: string) => void
  onClear: VoidFunction
  filteredSections: StyleSection[]
  hasResults: boolean
  isEmptyState: boolean
}

export const useGeneratorConfigStyleSearch = (
  styleSections: StyleSection[]
): UseGeneratorConfigStyleSearchResult => {
  const [query, setQuery] = useState('')
  const queryDebounced = useDebounce(query, 300)

  const filteredSections = useMemo(() => {
    if (isEmpty(queryDebounced)) {
      return styleSections
    }

    const searchTerm = queryDebounced.toLowerCase()

    return styleSections
      .map((section) => {
        const sectionMatches = section.id.toLowerCase().includes(searchTerm)

        if (sectionMatches) {
          return section
        }

        const matchingStyles = section.styles.filter((style) => {
          const isMatchName = style.name.toLowerCase().includes(searchTerm)
          const isMatchPositive = style.positive
            .toLowerCase()
            .includes(searchTerm)
          const isMatchNegative = style.negative
            ? style.negative.toLowerCase().includes(searchTerm)
            : false

          return isMatchName || isMatchPositive || isMatchNegative
        })

        return {
          ...section,
          styles: matchingStyles
        }
      })
      .filter((section) => !isEmpty(section.styles))
  }, [styleSections, queryDebounced])

  const onClear = () => setQuery('')

  const hasResults = !isEmpty(filteredSections)
  const isEmptyState = !hasResults && !isEmpty(query)

  return {
    query,
    setQuery,
    onClear,
    filteredSections,
    hasResults,
    isEmptyState
  }
}
