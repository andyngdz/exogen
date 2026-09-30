'use client'

import { useModelsView } from '@/features/model-search/states/useModelsView'
import { ModelsTab } from '@/features/model-search/types'
import { ModelManagement } from '@/features/settings/presentations/tabs'
import { ToggleButton, ToggleButtonGroup } from '@heroui/react'
import clsx from 'clsx'
import { FormProvider } from 'react-hook-form'
import { ModelSearchInput } from './ModelSearchInput'
import { ModelsEmptyView } from './ModelsEmptyView'
import { ModelsHuggingFace } from './ModelsHuggingFace'

/** Models as a rail view, per frames 2b and 3k. */
export const ModelsView = () => {
  const {
    tab,
    searchForm,
    installedLabel,
    isInstalledTab,
    hasNoModels,
    onTabChange,
    onSearchHuggingFace,
    onSeeRecommended
  } = useModelsView()

  return (
    <FormProvider {...searchForm}>
      <div className="flex min-w-0 flex-1 flex-col gap-0">
        <header
          className={clsx(
            'flex items-center justify-between gap-4',
            'h-14 shrink-0 px-6',
            'border-b border-separator'
          )}
        >
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold">Models</h1>
            <ToggleButtonGroup
              aria-label="Model source"
              size="sm"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[tab]}
              onSelectionChange={onTabChange}
            >
              <ToggleButton id={ModelsTab.INSTALLED}>
                {installedLabel}
              </ToggleButton>
              <ToggleButton id={ModelsTab.HUGGING_FACE}>
                Hugging Face
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          {!isInstalledTab && (
            <div className="w-85">
              <ModelSearchInput />
            </div>
          )}
        </header>
        {isInstalledTab && hasNoModels && (
          <ModelsEmptyView
            onSeeRecommended={onSeeRecommended}
            onSearchHuggingFace={onSearchHuggingFace}
          />
        )}
        {isInstalledTab && !hasNoModels && (
          <div className="min-h-0 flex-1 overflow-y-auto px-10 py-8">
            <div className="max-w-160">
              <ModelManagement />
            </div>
          </div>
        )}
        {!isInstalledTab && <ModelsHuggingFace />}
      </div>
    </FormProvider>
  )
}
