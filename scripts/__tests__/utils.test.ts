import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { $ } from 'zx'
import { projectRoot, runAsScript, setupLog } from '../utils'

describe('projectRoot', () => {
  it('resolves to the repository root directory', () => {
    // Verify projectRoot points to the actual project root
    expect(projectRoot).not.toMatch(/scripts$/)

    // Verify package.json exists in the root
    const packageJsonPath = join(projectRoot, 'package.json')
    expect(existsSync(packageJsonPath)).toBe(true)
  })
})

describe('runAsScript', () => {
  let exitSpy: MockInstance<typeof process.exit>
  let consoleErrorSpy: MockInstance<
    (message?: unknown, ...optionalParams: unknown[]) => void
  >

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit called with ${code}`)
    })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    exitSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('executes the task without exiting when it resolves', async () => {
    const task = vi.fn().mockResolvedValue(undefined)

    await runAsScript(task, 'Task failed:')

    expect(task).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(exitSpy).not.toHaveBeenCalled()
  })

  it('logs the failure and exits when the task rejects', async () => {
    const failure = new Error('Boom')
    const task = vi.fn().mockRejectedValue(failure)

    await expect(() => runAsScript(task, 'Task failed:')).rejects.toThrow(
      'process.exit called with 1'
    )

    expect(task).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Task failed:', 'Boom')
    expect(exitSpy).toHaveBeenCalledWith(1)
  })
})

describe('setupLog', () => {
  const originalForceColor = process.env.FORCE_COLOR

  beforeEach(() => {
    delete process.env.FORCE_COLOR
  })

  afterEach(() => {
    if (originalForceColor === undefined) {
      delete process.env.FORCE_COLOR
    } else {
      process.env.FORCE_COLOR = originalForceColor
    }
  })

  it('forces colored output and configures shell verbosity', () => {
    const shell = { verbose: false, stdio: 'pipe' } as unknown as $

    setupLog(shell)

    expect(shell.verbose).toBe(true)
    expect(shell.stdio).toBe('inherit')
    expect(process.env.FORCE_COLOR).toBe('1')
  })
})
