import { TopBarOption } from '@/features/generators/types'
import { ValueChanged } from '@/types'
import { ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { FC } from 'react'
import type { Key, Selection } from 'react-aria-components'

interface GeneratorTopBarSegmentsProps {
  label: string
  options: TopBarOption[]
  selectedKey: Key
  onSelectionChange: ValueChanged<Selection>
}

/** Single-select segmented control; icon options render icon-only with the label for screen readers. */
export const GeneratorTopBarSegments: FC<GeneratorTopBarSegmentsProps> = ({
  label,
  options,
  selectedKey,
  onSelectionChange
}) => {
  return (
    <ToggleButtonGroup
      aria-label={label}
      size="sm"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[selectedKey]}
      onSelectionChange={onSelectionChange}
    >
      {map(options, ({ id, label: optionLabel, icon: Icon }) => (
        <ToggleButton
          key={id}
          id={id}
          isIconOnly={Boolean(Icon)}
          aria-label={optionLabel}
        >
          {Icon ? <Icon size={14} /> : optionLabel}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
