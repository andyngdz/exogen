import { BackendStatusLevel } from '@types'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mock$ } = vi.hoisted(() => ({
  mock$: vi.fn()
}))

vi.mock('zx', () => ({
  $: (...args: unknown[]) => mock$(...args),
  usePowerShell: vi.fn()
}))

const { mockNormalizeError } = vi.hoisted(() => ({
  mockNormalizeError: vi.fn<(error: unknown, defaultMessage: string) => Error>()
}))

const { mockEnsurePathIncludes } = vi.hoisted(() => ({
  mockEnsurePathIncludes: vi.fn<(directories: string[]) => void>()
}))

let mockIsWindows = false

vi.mock('../utils', async () => {
  const actual = await vi.importActual('../utils')
  return {
    ...actual,
    get isWindows() {
      return mockIsWindows
    },
    ensurePathIncludes: mockEnsurePathIncludes,
    normalizeError: mockNormalizeError
  }
})

import { installUv } from '../install-uv'

type ProcessResult = {
  exitCode: number
  stdout: string
  stderr?: string
}

const makeProcessResult = (
  overrides: Partial<ProcessResult> = {}
): ProcessResult => ({
  exitCode: 0,
  stdout: '',
  stderr: '',
  ...overrides
})

describe('installUv', () => {
  const originalPlatform = process.platform

  beforeEach(() => {
    mock$.mockReset()
    mockNormalizeError.mockReset()
    mockEnsurePathIncludes.mockReset()

    mockIsWindows = false
    mockNormalizeError.mockImplementation(
      (error: unknown, defaultMessage: string) =>
        error instanceof Error ? error : new Error(defaultMessage)
    )

    vi.unstubAllEnvs()
    vi.stubEnv('HOME', '/home/tester')
    // Stub LOCALAPPDATA to prevent Windows path from being added on Windows test runners
    delete process.env.LOCALAPPDATA
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    })
  })

  it('returns the detected uv version when already installed', async () => {
    mock$.mockReturnValueOnce({
      nothrow: () =>
        Promise.resolve(makeProcessResult({ stdout: 'uv 0.2.0\n' }))
    })

    const emit = vi.fn()
    const result = await installUv({ emit })

    expect(result).toEqual({ version: '0.2.0' })
    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Info,
      message: 'uv 0.2.0 already installed.'
    })
    expect(mock$).toHaveBeenCalledTimes(1)
    expect(mockNormalizeError).not.toHaveBeenCalled()
    expect(mockEnsurePathIncludes).toHaveBeenCalledWith([
      path.join('/home/tester', '.local', 'bin')
    ])
  })

  it('installs uv on Unix-like systems when missing', async () => {
    mock$
      .mockReturnValueOnce({
        nothrow: () => Promise.resolve(makeProcessResult({ exitCode: 1 }))
      })
      .mockImplementationOnce(
        (strings: TemplateStringsArray, command: string) => {
          expect(strings).toEqual(['', ''])
          expect(command).toBe(
            'curl -LsSf https://astral.sh/uv/install.sh | sh'
          )
          return Promise.resolve()
        }
      )
      .mockReturnValueOnce({
        nothrow: () =>
          Promise.resolve(makeProcessResult({ stdout: 'uv 0.9.0\n' }))
      })

    const emit = vi.fn()
    const result = await installUv({ emit })

    expect(result).toEqual({ version: '0.9.0' })
    expect(emit).toHaveBeenNthCalledWith(1, {
      level: BackendStatusLevel.Info,
      message: 'Installing uv…'
    })
    expect(emit).toHaveBeenNthCalledWith(2, {
      level: BackendStatusLevel.Info,
      message: 'uv 0.9.0 installed successfully.'
    })
    expect(mock$).toHaveBeenCalledTimes(3)
    expect(mockEnsurePathIncludes).toHaveBeenCalledWith([
      path.join('/home/tester', '.local', 'bin')
    ])
  })

  it('uses the Windows installation command when running on Windows', async () => {
    mockIsWindows = true
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    })
    process.env.LOCALAPPDATA = 'C:\\Users\\tester\\AppData\\Local'

    mock$
      .mockReturnValueOnce({
        nothrow: () => Promise.resolve(makeProcessResult({ exitCode: 1 }))
      })
      .mockImplementationOnce(
        (strings: TemplateStringsArray, command: string) => {
          expect(strings).toEqual(['', ''])
          expect(command).toContain('powershell -ExecutionPolicy ByPass')
          return Promise.resolve()
        }
      )
      .mockReturnValueOnce({
        nothrow: () =>
          Promise.resolve(makeProcessResult({ stdout: 'uv 1.1.0\n' }))
      })

    const emit = vi.fn()
    const result = await installUv({ emit })

    expect(result).toEqual({ version: '1.1.0' })
    expect(emit).toHaveBeenNthCalledWith(1, {
      level: BackendStatusLevel.Info,
      message: 'Installing uv…'
    })
    expect(emit).toHaveBeenNthCalledWith(2, {
      level: BackendStatusLevel.Info,
      message: 'uv 1.1.0 installed successfully.'
    })
    expect(mockEnsurePathIncludes).toHaveBeenCalledWith([
      path.join('/home/tester', '.local', 'bin'),
      path.join('C:\\Users\\tester\\AppData\\Local', 'uv', 'bin')
    ])
  })

  it('emits an error with manual commands when installation fails', async () => {
    const installError = new Error('install failed')

    mock$
      .mockReturnValueOnce({
        nothrow: () => Promise.resolve(makeProcessResult({ exitCode: 1 }))
      })
      .mockImplementationOnce(() => Promise.reject(installError))

    const normalizedError = new Error('normalized error')
    mockNormalizeError.mockReturnValue(normalizedError)

    const emit = vi.fn()

    await expect(installUv({ emit })).rejects.toThrow('normalized error')

    expect(emit).toHaveBeenNthCalledWith(1, {
      level: BackendStatusLevel.Info,
      message: 'Installing uv…'
    })
    expect(emit).toHaveBeenNthCalledWith(2, {
      level: BackendStatusLevel.Error,
      message: 'uv installation failed. Run the command manually.',
      commands: [
        {
          label: 'Install with shell script',
          command: 'curl -LsSf https://astral.sh/uv/install.sh | sh'
        }
      ]
    })
    expect(mockNormalizeError).toHaveBeenCalledWith(
      installError,
      'Failed to install uv via provided command.'
    )
    expect(mockEnsurePathIncludes).toHaveBeenCalledWith([
      path.join('/home/tester', '.local', 'bin')
    ])
  })

  it('throws when version cannot be detected after installation', async () => {
    mock$
      .mockReturnValueOnce({
        nothrow: () => Promise.resolve(makeProcessResult({ exitCode: 1 }))
      })
      .mockImplementationOnce(() => Promise.resolve())
      .mockReturnValueOnce({
        nothrow: () => Promise.resolve(makeProcessResult({ stdout: '' }))
      })

    const emit = vi.fn()

    await expect(installUv({ emit })).rejects.toThrow(
      'uv installation completed but could not verify version.'
    )

    expect(emit).toHaveBeenNthCalledWith(1, {
      level: BackendStatusLevel.Info,
      message: 'Installing uv…'
    })
    expect(emit).toHaveBeenNthCalledWith(2, {
      level: BackendStatusLevel.Error,
      message: 'uv installation finished but version could not be detected.'
    })
    expect(mockEnsurePathIncludes).toHaveBeenCalledWith([
      path.join('/home/tester', '.local', 'bin')
    ])
  })
})
