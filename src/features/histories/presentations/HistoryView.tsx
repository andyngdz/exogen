'use client'

import { useHistoryView } from '@/features/histories/states/useHistoryView'
import { Chip, SearchField, Spinner } from '@heroui/react'
import clsx from 'clsx'
import { map } from 'es-toolkit/compat'
import { HistoryEmptyView } from './HistoryEmptyView'
import { HistoryRunCard } from './HistoryRunCard'
import { HistoryRunDetail } from './HistoryRunDetail'

/** History as a rail view, per frames 2c and 3j. */
export const HistoryView = () => {
  const view = useHistoryView()

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col gap-0">
        <header
          className={clsx(
            'flex items-center justify-between gap-4',
            'h-14 shrink-0 px-6'
          )}
        >
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold">History</h1>
            <Chip size="sm" variant="secondary">
              {view.runCount === 1 ? '1 run' : `${view.runCount} runs`}
            </Chip>
          </div>
          <SearchField
            aria-label="Search prompts"
            value={view.query}
            onChange={view.onQueryChange}
            isDisabled={view.hasNoRuns}
            className="w-75"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search prompts" />
              <SearchField.ClearButton aria-label="Clear search" />
            </SearchField.Group>
          </SearchField>
        </header>
        {view.isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        )}
        {view.hasNoRuns && (
          <HistoryEmptyView onGoToGenerate={view.onGoToGenerate} />
        )}
        {view.hasNoMatches && (
          <p className="px-6 text-sm text-muted">
            No runs match “{view.query}”.
          </p>
        )}
        <div
          className={clsx(
            'flex min-h-0 flex-1 flex-col',
            'gap-6 overflow-y-auto px-6 pb-6'
          )}
        >
          {map(view.days, (day) => (
            <section
              key={day.label}
              aria-label={day.label}
              className="flex flex-col gap-2"
            >
              <h2 className="text-xs font-medium text-muted">{day.label}</h2>
              <div className="flex flex-wrap gap-4">
                {map(day.runs, (history) => (
                  <HistoryRunCard
                    key={history.id}
                    history={history}
                    isSelected={history.id === view.selected?.id}
                    onSelect={() => view.onSelect(history.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      {view.selected && (
        <HistoryRunDetail key={view.selected.id} history={view.selected} />
      )}
    </div>
  )
}
