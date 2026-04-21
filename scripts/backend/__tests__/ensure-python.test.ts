import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import type { ensurePython311 as ensurePython311Type } from '../ensure-python'
import { BackendStatusLevel } from '@types'

type CommandRecorder = (
  pieces: TemplateStringsArray,
  ...args: unknown[]
) => {
  nothrow: () => Promise<{ exitCode: number; stdout: string; stderr: string }>
}

type CommandResult = {
  exitCode: number
  stdout: string
  stderr: string
}

const { mock$, commandQueue, recordedCommands, platformState } = vi.hoisted(
  () => {
    const queue: CommandResult[] = []
    const commands: string[] = []
    const innerMock$ = vi.fn<CommandRecorder>()
    const state = { platform: process.platform, isWindows: false, isMac: false }

    return {
      mock$: innerMock$,
      commandQueue: queue,
      recordedCommands: commands,
      platformState: state
    }
  }
)

vi.mock('zx', () => ({
  $: (...args: Parameters<CommandRecorder>) => mock$(...args),
  usePowerShell: vi.fn()
}))

vi.mock('../utils', () => ({
  get isWindows() {
    return platformState.isWindows
  },
  get isMac() {
    return platformState.isMac
  }
}))

let ensurePython311: typeof ensurePython311Type

beforeAll(async () => {
  ;({ ensurePython311 } = await import('../ensure-python'))
})

const originalPlatform = process.platform

const setPlatform = (platform: NodeJS.Platform) => {
  Object.defineProperty(process, 'platform', {
    value: platform,
    configurable: true
  })
  platformState.platform = platform
}

const resetPlatform = () => {
  Object.defineProperty(process, 'platform', {
    value: originalPlatform,
    configurable: true
  })
  platformState.platform = originalPlatform
}

const makeResult = (overrides: Partial<CommandResult> = {}): CommandResult => ({
  exitCode: 0,
  stdout: 'Python 3.11.0\n',
  stderr: '',
  ...overrides
})

beforeEach(() => {
  commandQueue.length = 0
  recordedCommands.length = 0
  platformState.isWindows = false
  platformState.isMac = false
  setPlatform(originalPlatform)

  mock$.mockImplementation(
    (pieces: TemplateStringsArray, ...args: unknown[]) => {
      const command = pieces.reduce((acc, part, index) => {
        const interpolation = index < args.length ? String(args[index]) : ''
        return acc + part + interpolation
      }, '')

      recordedCommands.push(command.trim())

      return {
        nothrow: () =>
          Promise.resolve(commandQueue.shift() ?? makeResult({ exitCode: 1 }))
      }
    }
  )
})

afterEach(() => {
  mock$.mockReset()
  resetPlatform()
})

describe('ensurePython311', () => {
  it('detects Python 3.11 using the first successful candidate', async () => {
    setPlatform('linux')
    commandQueue.push(makeResult({ stdout: 'Python 3.11.5\n' }))

    const emit = vi.fn()

    const result = await ensurePython311({ emit })

    expect(result).toEqual({
      command: 'python3.11',
      args: [],
      version: '3.11.5',
      minor: 11
    })
    expect(recordedCommands).toEqual(['python3.11 --version'])
    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Info,
      message: 'Python 3.11.5 detected.'
    })
    expect(emit).toHaveBeenCalledTimes(1)
  })

  it('continues through candidates until a 3.11+ interpreter is found', async () => {
    setPlatform('linux')

    commandQueue.push(
      makeResult({ stdout: 'Python 3.10.12\n' }),
      makeResult({ stdout: 'Python 3.11\n' })
    )

    const emit = vi.fn()

    const result = await ensurePython311({ emit })

    expect(result).toEqual({
      command: 'python3',
      args: [],
      version: '3.11.0',
      minor: 11
    })
    expect(recordedCommands).toEqual([
      'python3.11 --version',
      'python3 --version'
    ])
    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Info,
      message: 'Python 3.11.0 detected.'
    })
  })

  describe('Python 3.12+ support with warning', () => {
    it('accepts Python 3.12 and emits a warning', async () => {
      setPlatform('linux')
      commandQueue.push(makeResult({ stdout: 'Python 3.12.3\n' }))

      const emit = vi.fn()

      const result = await ensurePython311({ emit })

      expect(result).toEqual({
        command: 'python3.11',
        args: [],
        version: '3.12.3',
        minor: 12
      })
      expect(emit).toHaveBeenNthCalledWith(1, {
        level: BackendStatusLevel.Info,
        message: 'Python 3.12.3 detected.'
      })
      expect(emit).toHaveBeenNthCalledWith(2, {
        level: BackendStatusLevel.Info,
        message:
          'Python 3.12.3 may not be fully tested. Python 3.11 is recommended.'
      })
      expect(emit).toHaveBeenCalledTimes(2)
    })

    it('accepts Python 3.13 and emits a warning', async () => {
      setPlatform('linux')
      commandQueue.push(makeResult({ stdout: 'Python 3.13.7\n' }))

      const emit = vi.fn()

      const result = await ensurePython311({ emit })

      expect(result).toEqual({
        command: 'python3.11',
        args: [],
        version: '3.13.7',
        minor: 13
      })
      expect(emit).toHaveBeenNthCalledWith(1, {
        level: BackendStatusLevel.Info,
        message: 'Python 3.13.7 detected.'
      })
      expect(emit).toHaveBeenNthCalledWith(2, {
        level: BackendStatusLevel.Info,
        message:
          'Python 3.13.7 may not be fully tested. Python 3.11 is recommended.'
      })
      expect(emit).toHaveBeenCalledTimes(2)
    })

    it('does not emit warning for Python 3.11', async () => {
      setPlatform('linux')
      commandQueue.push(makeResult({ stdout: 'Python 3.11.9\n' }))

      const emit = vi.fn()

      await ensurePython311({ emit })

      expect(emit).toHaveBeenCalledTimes(1)
      expect(emit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Python 3.11.9 detected.'
      })
    })
  })

  describe('Python 3.10 and older rejection', () => {
    it('rejects Python 3.10 and throws error', async () => {
      setPlatform('linux')

      commandQueue.push(
        makeResult({ stdout: 'Python 3.10.12\n' }),
        makeResult({ stdout: 'Python 3.10.12\n' }),
        makeResult({ stdout: 'Python 3.10.12\n' })
      )

      const emit = vi.fn()

      await expect(ensurePython311({ emit })).rejects.toThrow(
        'Python 3.11+ is not installed.'
      )

      expect(emit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message:
          'Python 3.11+ is required. Install it with your system package manager.',
        commands: [
          { label: 'Update packages', command: 'sudo apt update' },
          {
            label: 'Install Python 3.11',
            command: 'sudo apt install python3.11'
          }
        ]
      })
    })
  })

  it('uses Windows-specific instructions when no interpreter is available', async () => {
    setPlatform('win32')
    platformState.isWindows = true

    // Exhaust all candidates with failures
    commandQueue.push(
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 })
    )

    const emit = vi.fn()

    await expect(ensurePython311({ emit })).rejects.toThrow(
      'Python 3.11+ is not installed.'
    )

    expect(recordedCommands).toEqual([
      'py -3.11,--version',
      'python3.11 --version',
      'python3 --version',
      'python --version',
      'py -3,--version'
    ])

    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
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
    })
  })

  it('uses macOS-specific instructions when no interpreter is available', async () => {
    setPlatform('darwin')
    platformState.isMac = true

    commandQueue.push(
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 })
    )

    const emit = vi.fn()

    await expect(ensurePython311({ emit })).rejects.toThrow(
      'Python 3.11+ is not installed.'
    )

    expect(recordedCommands).toEqual([
      'python3.11 --version',
      'python3 --version',
      'python --version'
    ])

    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message:
        'Python 3.11+ is required. Install it via Homebrew or download it from python.org.',
      commands: [
        {
          label: 'Install with Homebrew',
          command: 'brew install python@3.11'
        }
      ]
    })
  })

  it('defaults to Linux-style instructions when platform is not macOS or Windows', async () => {
    setPlatform('linux')

    commandQueue.push(
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 }),
      makeResult({ exitCode: 1 })
    )

    const emit = vi.fn()

    await expect(ensurePython311({ emit })).rejects.toThrow(
      'Python 3.11+ is not installed.'
    )

    expect(recordedCommands).toEqual([
      'python3.11 --version',
      'python3 --version',
      'python --version'
    ])

    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message:
        'Python 3.11+ is required. Install it with your system package manager.',
      commands: [
        { label: 'Update packages', command: 'sudo apt update' },
        { label: 'Install Python 3.11', command: 'sudo apt install python3.11' }
      ]
    })
  })
})
