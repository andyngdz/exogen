'use client'

import { ValueChanged } from '@/types'
import { SearchField } from '@heroui/react'
import { FC } from 'react'

export interface GeneratorConfigStyleSearchInputProps {
  value: string
  onChange: ValueChanged<string>
  onClear: VoidFunction
}

export const GeneratorConfigStyleSearchInput: FC<
  GeneratorConfigStyleSearchInputProps
> = ({ value, onChange, onClear }) => {
  return (
    <SearchField
      aria-label="Search styles"
      value={value}
      onChange={onChange}
      onClear={onClear}
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="Search styles by name, category, or keywords..." />
        <SearchField.ClearButton aria-label="Clear search" />
      </SearchField.Group>
    </SearchField>
  )
}
