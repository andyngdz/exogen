'use client'

import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { GeneratorConfigFormValues } from '../types/generator-config'

export const useGeneratorAspectRatio = (fallback = 1) => {
  const { watch } = useFormContext<GeneratorConfigFormValues>()
  const width = watch('width')
  const height = watch('height')

  return useMemo(() => {
    const ratio = width / height
    return Number.isFinite(ratio) ? ratio : fallback
  }, [fallback, height, width])
}
