import { useDownloadedModels } from '@/cores/hooks'
import { MODEL_SEARCH_FORM_DEFAULTS } from '@/features/model-search/constants'
import { ModelSearchFormValues, ModelsTab } from '@/features/model-search/types'
import { ValueChanged } from '@/types'
import { find, first, isEmpty, values } from 'es-toolkit/compat'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Selection } from 'react-aria-components'

/** Models as a full view: installed models, or a Hugging Face search. */
export const useModelsView = () => {
  const router = useRouter()
  const { downloadedModels } = useDownloadedModels()
  const [tab, setTab] = useState(ModelsTab.INSTALLED)
  const searchForm = useForm<ModelSearchFormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: MODEL_SEARCH_FORM_DEFAULTS
  })

  const onTabChange: ValueChanged<Selection> = (selection) => {
    if (selection === 'all') return

    const key = first(Array.from(selection))
    const nextTab = find(values(ModelsTab), (option) => option === key)
    if (nextTab) setTab(nextTab)
  }

  return {
    tab,
    searchForm,
    installedLabel: `Installed ${downloadedModels.length}`,
    isInstalledTab: tab === ModelsTab.INSTALLED,
    hasNoModels: isEmpty(downloadedModels),
    onTabChange,
    onSearchHuggingFace: () => setTab(ModelsTab.HUGGING_FACE),
    onSeeRecommended: () => router.push('/model-recommendations')
  }
}
