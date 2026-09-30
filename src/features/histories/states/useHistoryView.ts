import { useHistoriesQuery } from '@/cores/api-queries'
import { APP_SHELL_ACTIONS } from '@/features/app-shell/states/useAppShellStore'
import { AppView } from '@/features/app-shell/types'
import { historyViewService } from '@/features/histories/services/history-view'
import { find, first, isEmpty } from 'es-toolkit/compat'
import { useState } from 'react'

/** History as a full view: prompt search, runs by day, the selected run. */
export const useHistoryView = () => {
  const { data: histories = [], isLoading } = useHistoriesQuery()
  const [query, setQuery] = useState('')
  const [pickedId, setPickedId] = useState<number>()

  const matches = historyViewService.filterByPrompt(histories, query)
  const days = historyViewService.groupByDay(matches)
  // Falls back to the newest match when nothing is picked or the pick is filtered out.
  const selected = find(matches, { id: pickedId }) ?? first(first(days)?.runs)

  return {
    days,
    selected,
    runCount: histories.length,
    query,
    isLoading,
    hasNoRuns: !isLoading && isEmpty(histories),
    hasNoMatches: !isEmpty(histories) && isEmpty(matches),
    onQueryChange: setQuery,
    onSelect: setPickedId,
    onGoToGenerate: () => APP_SHELL_ACTIONS.setView(AppView.GENERATE)
  }
}
