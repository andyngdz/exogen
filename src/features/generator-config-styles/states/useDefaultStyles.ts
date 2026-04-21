import { isEmpty } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useLocalStorage } from 'react-use'

import { useStyleSections } from '@/cores/hooks'
import type { GeneratorConfigFormValues } from '@/features/generator-configs'

import { DEFAULT_STYLE_IDS, DEFAULTS_APPLIED_STORAGE_KEY } from '../constants'

/**
 * Applies default styles on first visit when styles array is empty
 * Persists across page reloads using localStorage
 */
export const useDefaultStyles = () => {
  const { setValue, watch } = useFormContext<GeneratorConfigFormValues>()
  const styles = watch('styles', [])
  const { styleItems } = useStyleSections()
  const [defaultsApplied, setDefaultsApplied] = useLocalStorage(
    DEFAULTS_APPLIED_STORAGE_KEY,
    false
  )

  useEffect(() => {
    if (!defaultsApplied && isEmpty(styles)) {
      const validDefaults = DEFAULT_STYLE_IDS.filter((id) =>
        styleItems.some((item) => item.id === id)
      )

      if (!isEmpty(validDefaults)) {
        setValue('styles', validDefaults)
        setDefaultsApplied(true)
      }
    }
  }, [defaultsApplied, styleItems, styles, setValue, setDefaultsApplied])
}
