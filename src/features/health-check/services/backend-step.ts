import { BackendSetupStatusEntry } from '@/features/health-check/states/useBackendSetupStatusStore'
import {
  BackendStepRow,
  BackendStepRowState
} from '@/features/health-check/types'
import { BackendStatusCommand, BackendStatusLevel } from '@types'
import dayjs from 'dayjs'
import { findLast, map } from 'es-toolkit/compat'

export class BackendStepService {
  /** Setup messages as rows: errors failed, the newest one running, the rest done. */
  toRows(
    entries: BackendSetupStatusEntry[],
    isHealthy: boolean
  ): BackendStepRow[] {
    return map(entries, (entry, index) => ({
      id: entry.id,
      message: entry.message,
      time: dayjs(entry.timestamp).format('HH:mm:ss'),
      state: this.toRowState(entry, index === entries.length - 1 && !isHealthy)
    }))
  }

  /** Setup failed when the newest message is an error. */
  isFailed(entries: BackendSetupStatusEntry[]) {
    return entries.at(-1)?.level === BackendStatusLevel.Error
  }

  /** The commands the setup suggested most recently, for the failed state. */
  toCommands(entries: BackendSetupStatusEntry[]): BackendStatusCommand[] {
    return (
      findLast(entries, (entry) => Boolean(entry.commands?.length))?.commands ??
      []
    )
  }

  private toRowState(entry: BackendSetupStatusEntry, isNewestPending: boolean) {
    if (entry.level === BackendStatusLevel.Error)
      return BackendStepRowState.FAILED
    if (isNewestPending) return BackendStepRowState.RUNNING
    return BackendStepRowState.DONE
  }
}

export const backendStepService = new BackendStepService()
