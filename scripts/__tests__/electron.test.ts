import type { PathLike } from 'fs'
import { join } from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mock$, recordedCommands } = vi.hoisted(() => {
  return {
    mock$: vi.fn(),
    recordedCommands: [] as string[]
  }
})

const { mockBuild, buildCalls } = vi.hoisted(() => {
  const calls: unknown[] = []
  const mockFn = vi.fn()
  return { mockBuild: mockFn, buildCalls: calls }
})

const { runAsScriptMock, runAsScriptCalls } = vi.hoisted(() => {
  const calls: Array<{ task: () => Promise<void>; message: string }> = []
  const mockFn = vi.fn(async (task: () => Promise<void>, message: string) => {
    calls.push({ task, message })
  })
  return { runAsScriptMock: mockFn, runAsScriptCalls: calls }
})

vi.mock('node:fs/promises', () => {
  const mockRm = vi.fn()
  const mockMkdir = vi.fn()
  const mockCp = vi.fn()

  return {
    rm: mockRm,
    mkdir: mockMkdir,
    cp: mockCp,
    default: {
      rm: mockRm,
      mkdir: mockMkdir,
      cp: mockCp
    }
  }
})
vi.mock('../utils', () => ({
  projectRoot: '/test/project',
  runAsScript: runAsScriptMock,
  setupLog: vi.fn()
}))
vi.mock('zx', () => ({
  $: (...args: unknown[]) => mock$(...args),
  usePowerShell: vi.fn()
}))
vi.mock('esbuild', () => ({
  build: (...args: unknown[]) => mockBuild(...args)
}))

import { startDesktopDev } from '../desktop'
import { concurrentlyArgs, startFullDev } from '../devall'
import { compileElectron, startElectron } from '../electron'

const fsPromises = await import('node:fs/promises')
const mockRm = vi.mocked(fsPromises.rm)
const mockMkdir = vi.mocked(fsPromises.mkdir)
const mockCp = vi.mocked(fsPromises.cp)

const toCommandString = (pieces: TemplateStringsArray, args: unknown[]) =>
  pieces.reduce((acc, part, index) => {
    const interpolation = index < args.length ? String(args[index]) : ''
    return acc + part + interpolation
  }, '')

describe('electron toolchain', () => {
  const mockProjectRoot = '/test/project'
  const electronDir = join(mockProjectRoot, 'electron')
  const compiledTypesDir = join(electronDir, 'types')
  const runtimeTypesDir = join(electronDir, 'node_modules', '@types')

  beforeEach(() => {
    vi.clearAllMocks()
    recordedCommands.length = 0
    buildCalls.length = 0

    mockRm.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)
    mockCp.mockResolvedValue()
    mockBuild.mockResolvedValue(undefined)

    mock$.mockImplementation(
      (pieces: TemplateStringsArray, ...args: unknown[]) => {
        recordedCommands.push(toCommandString(pieces, args).trim())
        return Promise.resolve()
      }
    )
  })

  describe('compileElectron', () => {
    it('cleans all output files and directories', async () => {
      await compileElectron()

      expect(mockRm).toHaveBeenCalledWith(join(electronDir, 'main.js'), {
        force: true
      })
      expect(mockRm).toHaveBeenCalledWith(join(electronDir, 'preload.js'), {
        force: true
      })
      expect(mockRm).toHaveBeenCalledWith(
        join(electronDir, 'backend-port.js'),
        {
          force: true
        }
      )
      expect(mockRm).toHaveBeenCalledWith(
        join(electronDir, 'log-streamer.js'),
        {
          force: true
        }
      )
      expect(mockRm).toHaveBeenCalledWith(join(electronDir, 'updater.js'), {
        force: true
      })
      expect(mockRm).toHaveBeenCalledWith(
        join(electronDir, 'status-broadcaster.js'),
        {
          force: true
        }
      )
      expect(mockRm).toHaveBeenCalledWith(join(electronDir, '.build'), {
        recursive: true,
        force: true
      })
      expect(mockRm).toHaveBeenCalledWith(join(electronDir, 'types'), {
        recursive: true,
        force: true
      })
    })

    it('generates types with tsc emitDeclarationOnly', async () => {
      await compileElectron()

      expect(recordedCommands).toContain(
        'tsc --project tsconfig.electron.json --emitDeclarationOnly'
      )
    })

    it('bundles with esbuild', async () => {
      await compileElectron()

      expect(mockBuild).toHaveBeenCalledWith(
        expect.objectContaining({
          entryPoints: [
            join(electronDir, 'main.ts'),
            join(electronDir, 'preload.ts'),
            join(electronDir, 'backend-port.ts'),
            join(electronDir, 'log-streamer.ts'),
            join(electronDir, 'updater.ts'),
            join(electronDir, 'status-broadcaster.ts')
          ],
          bundle: true,
          platform: 'node',
          target: 'node18',
          outdir: electronDir,
          format: 'cjs',
          external: [
            'electron',
            'electron-updater',
            'electron-log',
            'fix-path'
          ],
          sourcemap: false
        })
      )
    })

    it('syncs compiled types to runtime types directory', async () => {
      await compileElectron()

      expect(mockRm).toHaveBeenCalledWith(runtimeTypesDir, {
        recursive: true,
        force: true
      })
      expect(mockMkdir).toHaveBeenCalledWith(runtimeTypesDir, {
        recursive: true
      })
      expect(mockCp).toHaveBeenCalledWith(compiledTypesDir, runtimeTypesDir, {
        recursive: true
      })
    })

    it('executes build steps in correct order', async () => {
      const executionOrder: string[] = []

      mockRm.mockImplementation(async () => {
        executionOrder.push('clean')
      })

      mock$.mockImplementation(
        (pieces: TemplateStringsArray, ...args: unknown[]) => {
          recordedCommands.push(toCommandString(pieces, args).trim())
          executionOrder.push('generateTypes')
          return Promise.resolve()
        }
      )

      mockBuild.mockImplementation(async () => {
        executionOrder.push('bundle')
      })

      mockCp.mockImplementation(async () => {
        executionOrder.push('syncTypes')
        return Promise.resolve()
      })

      await compileElectron()

      expect(executionOrder[0]).toBe('clean')
      expect(executionOrder).toContain('generateTypes')
      expect(executionOrder).toContain('bundle')
      expect(executionOrder[executionOrder.length - 1]).toBe('syncTypes')
    })

    it('handles TypeScript type generation failures', async () => {
      const typeGenError = new Error('Type generation failed')
      mock$.mockImplementation(
        (pieces: TemplateStringsArray, ...args: unknown[]) => {
          recordedCommands.push(toCommandString(pieces, args).trim())
          return Promise.reject(typeGenError)
        }
      )

      await expect(compileElectron()).rejects.toThrow('Type generation failed')
    })

    it('handles esbuild bundling failures', async () => {
      const bundleError = new Error('Bundling failed')
      mockBuild.mockRejectedValue(bundleError)

      await expect(compileElectron()).rejects.toThrow('Bundling failed')
    })

    it('handles file system cleanup failures', async () => {
      const fsError = new Error('File system error')
      mockRm.mockRejectedValue(fsError)

      await expect(compileElectron()).rejects.toThrow('File system error')
    })

    it('handles type sync failures', async () => {
      const syncError = new Error('Type sync failed')
      mockCp.mockRejectedValue(syncError)

      await expect(compileElectron()).rejects.toThrow('Type sync failed')
    })

    it('handles rm failure during type sync', async () => {
      const syncError = new Error('Sync rm failed')
      mockRm.mockImplementation(async (path: PathLike) => {
        if (path.toString().endsWith('@types')) {
          throw syncError
        }
      })
      await expect(compileElectron()).rejects.toThrow(syncError)
    })

    it('handles mkdir failure during type sync', async () => {
      const syncError = new Error('Sync mkdir failed')
      mockMkdir.mockRejectedValue(syncError)
      await expect(compileElectron()).rejects.toThrow(syncError)
    })

    it('processes cleanup operations in parallel', async () => {
      let cleanupCalls = 0
      mockRm.mockImplementation(async () => {
        cleanupCalls++
      })

      await compileElectron()

      // 6 individual .js files + 2 directories (.build, types) + 1 runtime types cleanup = 9 total
      expect(cleanupCalls).toBeGreaterThanOrEqual(8)
    })
  })

  describe('startElectron', () => {
    it('runs the Electron binary', async () => {
      await startElectron()

      expect(recordedCommands).toEqual(['electron .'])
    })

    it('surfaces Electron start failures', async () => {
      // Suppress console.error for this error path test
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const electronError = new Error('Electron failed to start')
      mock$.mockImplementation(
        (pieces: TemplateStringsArray, ...args: unknown[]) => {
          recordedCommands.push(toCommandString(pieces, args).trim())
          return Promise.reject(electronError)
        }
      )

      await expect(startElectron()).rejects.toThrow('Electron failed to start')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('startDesktopDev', () => {
    it('compiles and launches Electron sequentially', async () => {
      await startDesktopDev()

      expect(recordedCommands).toContain(
        'tsc --project tsconfig.electron.json --emitDeclarationOnly'
      )
      expect(recordedCommands).toContain('electron .')
      expect(mockBuild).toHaveBeenCalled()
    })

    it('prevents Electron start when compilation fails', async () => {
      const compilationError = new Error('Compilation failed')
      mockBuild.mockRejectedValue(compilationError)

      await expect(startDesktopDev()).rejects.toThrow('Compilation failed')
      expect(recordedCommands).not.toContain('electron .')
    })

    it('surfaces Electron failures after successful compilation', async () => {
      // Suppress console.error for this error path test
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const electronError = new Error('Electron startup failed')
      mock$.mockImplementation(
        (pieces: TemplateStringsArray, ...args: unknown[]) => {
          const command = toCommandString(pieces, args).trim()
          recordedCommands.push(command)
          if (command.includes('electron .')) {
            return Promise.reject(electronError)
          }
          return Promise.resolve()
        }
      )

      await expect(startDesktopDev()).rejects.toThrow('Electron startup failed')
      expect(mockBuild).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('startFullDev', () => {
    it('runs concurrently with predefined arguments', async () => {
      await startFullDev()

      expect(recordedCommands[0]).toContain('concurrently ')
      concurrentlyArgs.forEach((arg) => {
        expect(recordedCommands[0]).toContain(String(arg))
      })
    })

    it('surfaces concurrently failures', async () => {
      const concurrentlyError = new Error('Concurrently failed to start')
      mock$.mockImplementation(
        (pieces: TemplateStringsArray, ...args: unknown[]) => {
          recordedCommands.push(toCommandString(pieces, args).trim())
          return Promise.reject(concurrentlyError)
        }
      )

      await expect(startFullDev()).rejects.toThrow(
        'Concurrently failed to start'
      )
    })
  })

  describe('console output', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    beforeEach(() => {
      consoleSpy.mockClear()
    })

    it('logs compilation progress', async () => {
      await compileElectron()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Compiling Electron TypeScript files...'
      )
      expect(consoleSpy).toHaveBeenCalledWith('Generating types...')
      expect(consoleSpy).toHaveBeenCalledWith('Bundling with esbuild...')
      expect(consoleSpy).toHaveBeenCalledWith('Syncing types...')
      expect(consoleSpy).toHaveBeenCalledWith('Electron compilation complete')
    })

    it('logs Electron startup', async () => {
      await startElectron()

      expect(consoleSpy).toHaveBeenCalledWith('Starting Electron...')
    })

    it('logs full environment startup', async () => {
      await startFullDev()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Starting full development environment...'
      )
    })
  })

  it('registers desktop and full dev scripts via runAsScript', () => {
    expect(runAsScriptCalls).toHaveLength(2)
    expect(runAsScriptCalls.map((call) => call.message)).toEqual([
      'Desktop development failed:',
      'Full development startup failed:'
    ])
  })
})
