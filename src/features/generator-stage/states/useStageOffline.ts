import { useSocketConnectionStore } from '@/cores/sockets'
import { dateFormatter } from '@/services/date-formatter'

export const useStageOffline = () => {
  const lastConnectedAt = useSocketConnectionStore(
    (state) => state.lastConnectedAt
  )

  return {
    ...(lastConnectedAt && {
      lastResponseLabel: `Last response ${dateFormatter.timeFromTimestamp(lastConnectedAt)}`
    })
  }
}
