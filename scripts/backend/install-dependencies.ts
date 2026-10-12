import { $ } from '@scripts/zx-config'
import {
  BackendStatusEmitter,
  BackendStatusLevel,
  BackendStatusCommand
} from '@types'
import { isOnline, OfflineError } from './network'
import { normalizeError } from './utils'

export interface InstallDependenciesOptions {
  backendPath: string
  emit: BackendStatusEmitter
}

const installDependencies = async ({
  backendPath,
  emit
}: InstallDependenciesOptions): Promise<void> => {
  $.cwd = backendPath

  emit({
    level: BackendStatusLevel.Info,
    message: 'Installing Python dependencies…'
  })

  const command = 'uv'
  const args = ['sync']
  const installCommand = [command, ...args].join(' ')

  try {
    await $`${command} ${args}`

    emit({
      level: BackendStatusLevel.Info,
      message: 'Dependencies installed successfully'
    })
  } catch (error) {
    // uv sync downloads Python and the wheels on a first run.
    if (!(await isOnline())) {
      throw new OfflineError()
    }

    const commands: BackendStatusCommand[] = [
      {
        label: 'Install dependencies manually',
        command: installCommand
      }
    ]

    emit({
      level: BackendStatusLevel.Error,
      message: 'Failed to install dependencies. Run the command manually.',
      commands
    })

    throw normalizeError(error, 'Failed to install dependencies')
  }
}

export { installDependencies }
