import {
  TOP_BAR_MODE_OPTIONS,
  TOP_BAR_VIEW_OPTIONS
} from '@/features/generators/constants/top-bar'
import { useGeneratorTopBar } from '@/features/generators/states/useGeneratorTopBar'
import { ModelSelector } from '@/features/model-selectors/presentations/ModelSelector'
import clsx from 'clsx'
import { GeneratorTopBarSegments } from './GeneratorTopBarSegments'

export const GeneratorTopBar = () => {
  const { mode, viewMode, onModeSelectionChange, onViewSelectionChange } =
    useGeneratorTopBar()

  return (
    <header
      className={clsx(
        'flex items-center justify-between gap-4',
        'h-14 shrink-0 px-4'
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <ModelSelector />
        <GeneratorTopBarSegments
          label="Mode"
          options={TOP_BAR_MODE_OPTIONS}
          selectedKey={mode}
          onSelectionChange={onModeSelectionChange}
        />
      </div>
      <GeneratorTopBarSegments
        label="View"
        options={TOP_BAR_VIEW_OPTIONS}
        selectedKey={viewMode}
        onSelectionChange={onViewSelectionChange}
      />
    </header>
  )
}
