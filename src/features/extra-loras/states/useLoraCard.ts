import type { GeneratorConfigFormValues } from '@/features/generator-configs'
import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

/**
 * Hook to manage an individual LoRA card's weight state directly against the form.
 * It derives the current weight from the `loras` array and provides a setter
 * that updates only the matching entry. If the entry is missing, it will no-op
 * (cards should only render for selected LoRAs).
 */
export const useLoraCard = (loraId: number) => {
  const { watch, setValue } = useFormContext<GeneratorConfigFormValues>()
  const loras = watch('loras', [])

  const weight = useMemo(() => {
    const lora = loras.find((l) => l.lora_id === loraId)
    if (lora) return lora.weight

    return 1
  }, [loras, loraId])

  const setWeight = useCallback(
    (newWeight: number) => {
      setValue(
        'loras',
        loras.map((l) =>
          l.lora_id === loraId ? { ...l, weight: newWeight } : l
        )
      )
    },
    [loras, loraId, setValue]
  )

  return { weight, setWeight }
}
