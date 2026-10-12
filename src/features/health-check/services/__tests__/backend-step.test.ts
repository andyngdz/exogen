import { BackendSetupStatusEntry } from '@/features/health-check/states/useBackendSetupStatusStore'
import { BackendStepRowState } from '@/features/health-check/types'
import { BackendStatusLevel } from '@types'
import { map } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { backendStepService } from '../backend-step'

const entry = (
  id: string,
  level: BackendStatusLevel,
  commands: BackendSetupStatusEntry['commands'] = []
): BackendSetupStatusEntry => ({
  id,
  level,
  message: id,
  timestamp: 0,
  commands
})

describe('backendStepService', () => {
  it('marks the newest step running until the backend answers', () => {
    const entries = [
      entry('python', BackendStatusLevel.Info),
      entry('start', BackendStatusLevel.Info)
    ]

    expect(map(backendStepService.toRows(entries, false), 'state')).toEqual([
      BackendStepRowState.DONE,
      BackendStepRowState.RUNNING
    ])
    expect(map(backendStepService.toRows(entries, true), 'state')).toEqual([
      BackendStepRowState.DONE,
      BackendStepRowState.DONE
    ])
  })

  it('fails on a newest error and keeps its suggested commands', () => {
    const command = { label: 'Install uv', command: 'curl … | sh' }
    const entries = [
      entry('python', BackendStatusLevel.Info),
      entry('uv', BackendStatusLevel.Error, [command])
    ]

    expect(backendStepService.isFailed(entries)).toBe(true)
    expect(backendStepService.toRows(entries, false)[1].state).toBe(
      BackendStepRowState.FAILED
    )
    expect(backendStepService.toCommands(entries)).toEqual([command])
  })
})
