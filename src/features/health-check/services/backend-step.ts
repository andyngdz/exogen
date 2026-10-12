import {
  BackendSetupStatusEntry,
  BackendSetupStatusState
} from '@/features/health-check/states/useBackendSetupStatusStore'
import {
  BackendStepPhase,
  BackendStepRow,
  BackendStepRowState
} from '@/features/health-check/types'
import { BackendStatusCommand, BackendStatusLevel } from '@types'
import dayjs from 'dayjs'
import { findLast, map } from 'es-toolkit/compat'

export class BackendStepService {
  /** Setup messages as rows: errors failed, offline marked, the newest one running, the rest done. */
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

  /** The setup phase: failed or offline when the newest message says so, else running. */
  toPhase(entries: BackendSetupStatusEntry[]) {
    switch (entries.at(-1)?.level) {
      case BackendStatusLevel.Error:
        return BackendStepPhase.FAILED
      case BackendStatusLevel.Offline:
        return BackendStepPhase.OFFLINE
      default:
        return BackendStepPhase.RUNNING
    }
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
    if (entry.level === BackendStatusLevel.Offline)
      return BackendStepRowState.OFFLINE
    if (isNewestPending) return BackendStepRowState.RUNNING
    return BackendStepRowState.DONE
  }
}

export const backendStepService = new BackendStepService()

/** Store selector for the setup phase the newest message puts the Backend step in. */
export const selectBackendStepPhase = (state: BackendSetupStatusState) =>
  backendStepService.toPhase(state.entries)
