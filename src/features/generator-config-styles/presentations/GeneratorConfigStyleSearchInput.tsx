'use client'

import { Input } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { Search } from 'lucide-react'
import { FC } from 'react'

export interface GeneratorConfigStyleSearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: VoidFunction
}

export const GeneratorConfigStyleSearchInput: FC<
  GeneratorConfigStyleSearchInputProps
> = ({ value, onChange, onClear }) => {
  return (
    <Input
      placeholder="Search styles by name, category, or keywords..."
      value={value}
      onValueChange={onChange}
      startContent={<Search size={18} />}
      isClearable={!isEmpty(value)}
      onClear={onClear}
    />
  )
}
