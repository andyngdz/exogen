import {
  BackendStatusCommand,
  BackendStatusEmitter,
  BackendStatusLevel
} from '@types'
import * as path from 'node:path'
import { $ } from '../zx-config'
import { ensurePathIncludes, isWindows, normalizeError } from './utils'

interface InstallUvOptions {
  emit: BackendStatusEmitter
}

interface InstallCommand {
  label: string
  command: string
  run: () => Promise<unknown>
}

const uvVersionRegex = /uv\s+([\w.-]+)/i

const detectUv = async () => {
  const result = await $`uv --version`.nothrow()

  if (result.exitCode !== 0) {
    return
  }

  const match = result.stdout.match(uvVersionRegex)

  if (!match) {
    return
  }

  return { version: match[1] }
}

const getInstallCommand = (): InstallCommand => {
  if (isWindows) {
    const command =
      'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'

    return {
      label: 'Install uv via PowerShell',
      command,
      run: () => $`${command}`
    }
  }

  const command = 'curl -LsSf https://astral.sh/uv/install.sh | sh'

  return {
    label: 'Install uv via shell script',
    command,
    run: () => $`${command}`
  }
}

const installationCommandsByPlatform = (): BackendStatusCommand[] => {
  if (isWindows) {
    return [
      {
        label: 'Install with PowerShell',
        command:
          'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'
      }
    ]
  }

  return [
    {
      label: 'Install with shell script',
      command: 'curl -LsSf https://astral.sh/uv/install.sh | sh'
    }
  ]
}

const installUv = async ({ emit }: InstallUvOptions) => {
  const candidatePaths: string[] = []

  if (process.env.HOME) {
    candidatePaths.push(path.join(process.env.HOME, '.local', 'bin'))
  }

  if (isWindows && process.env.LOCALAPPDATA) {
    candidatePaths.push(path.join(process.env.LOCALAPPDATA, 'uv', 'bin'))
  }

  ensurePathIncludes(candidatePaths)

  const existing = await detectUv()

  if (existing) {
    emit({
      level: BackendStatusLevel.Info,
      message: `uv ${existing.version} already installed.`
    })

    return existing
  }

  const install = getInstallCommand()

  emit({
    level: BackendStatusLevel.Info,
    message: 'Installing uv…'
  })

  try {
    await install.run()
  } catch (error) {
    const commands = installationCommandsByPlatform()

    emit({
      level: BackendStatusLevel.Error,
      message: 'uv installation failed. Run the command manually.',
      commands
    })

    throw normalizeError(error, 'Failed to install uv via provided command.')
  }

  const installed = await detectUv()

  if (!installed) {
    emit({
      level: BackendStatusLevel.Error,
      message: 'uv installation finished but version could not be detected.'
    })

    throw new Error('uv installation completed but could not verify version.')
  }

  emit({
    level: BackendStatusLevel.Info,
    message: `uv ${installed.version} installed successfully.`
  })

  return installed
}

export { installUv }
