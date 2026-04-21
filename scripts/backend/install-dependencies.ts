import { $ } from '../zx-config'
import {
  BackendStatusEmitter,
  BackendStatusLevel,
  BackendStatusCommand
} from '@types'
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
