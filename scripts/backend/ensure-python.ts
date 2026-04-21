import {
  BackendStatusCommand,
  BackendStatusEmitter,
  BackendStatusLevel
} from '@types'
import { $ } from '../zx-config'
import { isMac, isWindows } from './utils'

interface PythonCandidate {
  command: string
  baseArgs: string[]
}

interface EnsurePythonOptions {
  emit: BackendStatusEmitter
}

interface MissingInstruction {
  message: string
  commands: BackendStatusCommand[]
}

/**
 * Matches Python version output strings.
 * Accepts formats like:
 *   - 'Python 3.11'
 *   - 'Python 3.11.0'
 *   - 'Python 3.11.7'
 * Capturing groups:
 *   1: Major version (e.g., '3')
 *   2: Minor version (e.g., '11')
 *   3: Patch version (e.g., '0', '7'), optional
 */
const versionRegex = /Python\s+(\d+)\.(\d+)(?:\.(\d+))?/i

const MIN_MINOR_VERSION = 11

const pythonCandidates = (): PythonCandidate[] => {
  if (process.platform === 'win32') {
    return [
      { command: 'py', baseArgs: ['-3.11'] },
      { command: 'python3.11', baseArgs: [] },
      { command: 'python3', baseArgs: [] },
      { command: 'python', baseArgs: [] },
      { command: 'py', baseArgs: ['-3'] }
    ]
  }

  return [
    { command: 'python3.11', baseArgs: [] },
    { command: 'python3', baseArgs: [] },
    { command: 'python', baseArgs: [] }
  ]
}

const parseVersion = (output: string) => {
  const match = versionRegex.exec(output)

  if (!match) {
    return
  }

  const major = Number.parseInt(match[1], 10)
  const minor = Number.parseInt(match[2], 10)
  const patch = match[3] ?? '0'

  return {
    version: `${major}.${minor}.${patch}`,
    major,
    minor
  }
}

const tryCandidate = async (candidate: PythonCandidate) => {
  const args = [...candidate.baseArgs, '--version']
  const result = await $`${candidate.command} ${args}`.nothrow()

  if (result.exitCode !== 0) {
    return
  }

  const versionOutput = result.stdout.trim()
  const parsed = parseVersion(versionOutput)

  if (parsed?.major === 3 && parsed.minor >= MIN_MINOR_VERSION) {
    return {
      command: candidate.command,
      args: candidate.baseArgs,
      version: parsed.version,
      minor: parsed.minor
    }
  }
}

const findPython = async () => {
  for (const candidate of pythonCandidates()) {
    const detected = await tryCandidate(candidate)

    if (detected) {
      return detected
    }
  }
}

const missingInstructions = (): MissingInstruction => {
  if (isMac) {
    return {
      message:
        'Python 3.11+ is required. Install it via Homebrew or download it from python.org.',
      commands: [
        {
          label: 'Install with Homebrew',
          command: 'brew install python@3.11'
        }
      ]
    }
  }

  if (isWindows) {
    return {
      message:
        'Python 3.11+ is required. Install it using winget, Chocolatey, or from python.org.',
      commands: [
        {
          label: 'Install with winget',
          command:
            'winget install Python.Python.3.11 --exact --silent --accept-package-agreements --accept-source-agreements'
        },
        {
          label: 'Install with Chocolatey',
          command: 'choco install python --version=3.11.9 -y'
        }
      ]
    }
  }

  return {
    message:
      'Python 3.11+ is required. Install it with your system package manager.',
    commands: [
      {
        label: 'Update packages',
        command: 'sudo apt update'
      },
      {
        label: 'Install Python 3.11',
        command: 'sudo apt install python3.11'
      }
    ]
  }
}

const ensurePython311 = async ({ emit }: EnsurePythonOptions) => {
  const existing = await findPython()

  if (existing) {
    emit({
      level: BackendStatusLevel.Info,
      message: `Python ${existing.version} detected.`
    })

    if (existing.minor > MIN_MINOR_VERSION) {
      emit({
        level: BackendStatusLevel.Info,
        message: `Python ${existing.version} may not be fully tested. Python 3.11 is recommended.`
      })
    }

    return existing
  }

  const { message, commands } = missingInstructions()

  emit({
    level: BackendStatusLevel.Error,
    message,
    commands
  })

  throw new Error('Python 3.11+ is not installed.')
}

export { ensurePython311 }
