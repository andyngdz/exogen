import { useHistoriesQuery } from '@/cores/api-queries'
import { useBackendUrl } from '@/cores/backend-initialization'
import { recentRunService } from '@/features/generator-stage/services/recent-runs'

const RECENT_RUN_LIMIT = 5

export const useRecentRuns = () => {
  const baseURL = useBackendUrl()
  const { data: histories = [] } = useHistoriesQuery()

  return {
    recentRuns: recentRunService.toRecentRuns(
      histories,
      baseURL,
      RECENT_RUN_LIMIT
    )
  }
}
