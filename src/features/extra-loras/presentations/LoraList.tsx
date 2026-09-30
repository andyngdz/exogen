import { useLorasQuery } from '@/cores/api-queries'
import { useLoraSelection } from '@/features/extra-loras/states'
import { isEmpty, map } from 'es-toolkit/compat'
import { useMemo } from 'react'
import { LoraListItem } from './LoraListItem'
import { UploadLoraButton } from './UploadLoraButton'

export const LoraList = () => {
  const { data } = useLorasQuery()
  const { toggleLora, selectedIds } = useLoraSelection()

  const LoraItems = useMemo(() => {
    if (isEmpty(data)) {
      return (
        <p className="py-4 text-center text-sm text-muted">
          No LoRAs available. Upload a LoRA file to get started.
        </p>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        {map(data, (lora) => (
          <LoraListItem
            key={lora.id}
            lora={lora}
            isSelected={selectedIds.has(lora.id)}
            onSelect={() => toggleLora(lora)}
          />
        ))}
      </div>
    )
  }, [data, selectedIds, toggleLora])

  return (
    <div className="flex flex-col gap-4">
      {LoraItems}
      <UploadLoraButton />
    </div>
  )
}
