import { useLorasQuery } from '@/cores/api-queries'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import type { LoRA } from '@/types'
import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

export const useLoraSelection = () => {
  const { setValue, watch } = useFormContext<GeneratorConfigFormValues>()
  const loras = watch('loras', [])
  const { data } = useLorasQuery()

  const addLora = useCallback(
    (lora: LoRA) => {
      const exists = loras.some((l) => l.lora_id === lora.id)

      if (!exists) {
        setValue('loras', [...loras, { lora_id: lora.id, weight: 1 }])
      }
    },
    [loras, setValue]
  )

  const removeLora = useCallback(
    (loraId: number) => {
      setValue(
        'loras',
        loras.filter((l) => l.lora_id !== loraId)
      )
    },
    [loras, setValue]
  )

  const toggleLora = useCallback(
    (lora: LoRA) => {
      const exists = loras.some((l) => l.lora_id === lora.id)

      if (exists) {
        setValue(
          'loras',
          loras.filter((entry) => entry.lora_id !== lora.id)
        )
      } else {
        setValue('loras', [...loras, { lora_id: lora.id, weight: 1 }])
      }
    },
    [loras, setValue]
  )

  const selectedLoras = useMemo(() => {
    if (data) {
      return loras
        .map((l) => data.find((lora) => lora.id === l.lora_id))
        .filter(Boolean) as LoRA[]
    }

    return []
  }, [loras, data])

  const selectedIds = useMemo(() => {
    return new Set(selectedLoras.map((l) => l.id))
  }, [selectedLoras])

  return {
    selectedLoras,
    selectedIds,
    addLora,
    removeLora,
    toggleLora
  }
}
