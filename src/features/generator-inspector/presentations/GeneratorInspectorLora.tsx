import { LoraCard, LoraList } from '@/features/extra-loras/presentations'
import { useLoraSelection } from '@/features/extra-loras/states'
import { InspectorSection } from '@/features/generator-inspector/presentations/InspectorSection'
import { isEmpty, map } from 'es-toolkit/compat'

export const GeneratorInspectorLora = () => {
  const { selectedLoras, removeLora } = useLoraSelection()

  return (
    <div>
      <InspectorSection title="Active">
        {isEmpty(selectedLoras) && (
          <span className="text-sm text-muted">
            Add a LoRA from the library below.
          </span>
        )}
        {map(selectedLoras, (lora) => (
          <LoraCard
            key={lora.id}
            lora={lora}
            onRemove={() => removeLora(lora.id)}
          />
        ))}
      </InspectorSection>
      <InspectorSection title="Library">
        <LoraList />
      </InspectorSection>
    </div>
  )
}
