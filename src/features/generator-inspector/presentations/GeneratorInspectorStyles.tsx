import { useStyleSections } from '@/cores/hooks/useStyleSections'
import { GeneratorConfigStyleEmptyState } from '@/features/generator-config-styles/presentations/GeneratorConfigStyleEmptyState'
import { GeneratorConfigStyleSearchInput } from '@/features/generator-config-styles/presentations/GeneratorConfigStyleSearchInput'
import { GeneratorConfigStyleSection } from '@/features/generator-config-styles/presentations/GeneratorConfigStyleSection'
import { GeneratorConfigStyleSelectedPreviewer } from '@/features/generator-config-styles/presentations/GeneratorConfigStyleSelectedPreviewer'
import { useGeneratorConfigStyleSearch } from '@/features/generator-config-styles/states'
import { InspectorSection } from '@/features/generator-inspector/presentations/InspectorSection'
import { TriangleAlert } from 'lucide-react'

export const GeneratorInspectorStyles = () => {
  const { styleSections } = useStyleSections()
  const { query, setQuery, onClear, filteredSections, isEmptyState } =
    useGeneratorConfigStyleSearch(styleSections)

  return (
    <div>
      <InspectorSection title="Selected">
        <GeneratorConfigStyleSearchInput
          value={query}
          onChange={setQuery}
          onClear={onClear}
        />
        <GeneratorConfigStyleSelectedPreviewer />
      </InspectorSection>
      <InspectorSection title="All styles">
        {isEmptyState && <GeneratorConfigStyleEmptyState query={query} />}
        {!isEmptyState && (
          <GeneratorConfigStyleSection styleSections={filteredSections} />
        )}
        <span className="flex items-center gap-2 text-xs text-warning">
          <TriangleAlert size={14} />
          Some styles may add NSFW content. Hover a style to preview it.
        </span>
      </InspectorSection>
    </div>
  )
}
