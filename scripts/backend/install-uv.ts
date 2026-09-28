import {
  BackendStatusCommand,
  BackendStatusEmitter,
  BackendStatusLevel
} from '@types'
import * as os from 'node:os'
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

const getInstallCommand = (installDir: string) => {
  const installShell = $({
    env: { ...process.env, UV_INSTALL_DIR: installDir }
  })

  // zx quotes an interpolated value as one argument, so the pipeline has to
  // go through `-c` instead of being interpolated as the whole command.
  if (isWindows) {
    const script = 'irm https://astral.sh/uv/install.ps1 | iex'

    return {
      label: 'Install uv via PowerShell',
      command: `powershell -ExecutionPolicy ByPass -c "${script}"`,
      run: () => installShell`powershell -ExecutionPolicy ByPass -c ${script}`
    } satisfies InstallCommand
  }

  const command = 'curl -LsSf https://astral.sh/uv/install.sh | sh'

  return {
    label: 'Install uv via shell script',
    command,
    run: () => installShell`sh -c ${command}`
  } satisfies InstallCommand
}

const installationCommandsByPlatform = () => {
  if (isWindows) {
    return [
      {
        label: 'Install with PowerShell',
        command:
          'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'
      }
    ] satisfies BackendStatusCommand[]
  }

  return [
    {
      label: 'Install with shell script',
      command: 'curl -LsSf https://astral.sh/uv/install.sh | sh'
    }
  ] satisfies BackendStatusCommand[]
}

const installUv = async ({ emit }: InstallUvOptions) => {
  // os.homedir() also resolves on Windows, where HOME is usually unset.
  const uvBinDir = path.join(os.homedir(), '.local', 'bin')

  ensurePathIncludes([uvBinDir])

  const existing = await detectUv()

  if (existing) {
    emit({
      level: BackendStatusLevel.Info,
      message: `uv ${existing.version} already installed.`
    })

    return existing
  }

  const install = getInstallCommand(uvBinDir)

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

  // A fresh install creates the directory, which the first call skipped.
  ensurePathIncludes([uvBinDir])

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
