import { BackendStatusLevel } from '@types'
import { mkdtempSync, rmSync } from 'node:fs'
import { Server } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDefaultStatusEmitter,
  ensurePathIncludes,
  findAvailablePort,
  isLinux,
  isMac,
  isPortAvailable,
  isWindows,
  normalizeError,
  pathExists
} from '../utils'

vi.mock('node:fs/promises', () => ({
  access: vi.fn()
}))

const fsPromises = await import('node:fs/promises')
const mockAccess = vi.mocked(fsPromises.access)

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('pathExists', () => {
    it('should return true when path exists', async () => {
      mockAccess.mockResolvedValue()

      const result = await pathExists('/test/path')

      expect(result).toBe(true)
      expect(mockAccess).toHaveBeenCalledWith('/test/path')
    })

    it('should return false when path does not exist', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException
      error.code = 'ENOENT'
      mockAccess.mockRejectedValue(error)

      const result = await pathExists('/nonexistent/path')

      expect(result).toBe(false)
    })

    it('should throw error for non-ENOENT errors', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException
      error.code = 'EACCES'
      mockAccess.mockRejectedValue(error)

      await expect(pathExists('/test/path')).rejects.toThrow(
        'Permission denied'
      )
    })
  })

  describe('normalizeError', () => {
    it('should return Error instance unchanged', () => {
      const error = new Error('Test error')
      const result = normalizeError(error, 'Default message')

      expect(result).toBe(error)
      expect(result.message).toBe('Test error')
    })

    it('should convert non-Error to Error with default message', () => {
      const result = normalizeError('string error', 'Default message')

      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('Default message')
    })

    it('should handle null/undefined', () => {
      const result = normalizeError(null, 'Default message')

      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('Default message')
    })
  })

  describe('createDefaultStatusEmitter', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    beforeEach(() => {
      consoleSpy.mockClear()
    })

    it('should create emitter that logs info messages', () => {
      const emit = createDefaultStatusEmitter()

      emit({
        level: BackendStatusLevel.Info,
        message: 'Test info message'
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Backend Setup][Info] Test info message'
      )
    })

    it('should create emitter that logs error messages', () => {
      const emit = createDefaultStatusEmitter()

      emit({
        level: BackendStatusLevel.Error,
        message: 'Test error message'
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Backend Setup][Error] Test error message'
      )
    })
  })

  describe('ensurePathIncludes', () => {
    const separator = isWindows ? ';' : ':'
    const pathKey = (() => {
      if (!isWindows) {
        return 'PATH'
      }

      const match = Object.keys(process.env).find(
        (key) => key.toLowerCase() === 'path'
      )

      return match ?? 'PATH'
    })()
    const baseEntries = isWindows
      ? ['C:\\Loop\\bin', 'C:\\Loop']
      : ['/usr/bin', '/bin']
    let originalPath: string | undefined
    let tempDirectory: string

    beforeEach(() => {
      originalPath = process.env[pathKey]
      tempDirectory = mkdtempSync(join(tmpdir(), 'ensure-path-'))
    })

    afterEach(() => {
      if (originalPath === undefined) {
        delete process.env[pathKey]
      } else {
        process.env[pathKey] = originalPath
      }

      rmSync(tempDirectory, { recursive: true, force: true })
    })

    it('should do nothing when no directories are provided', () => {
      ensurePathIncludes([])

      expect(process.env[pathKey]).toBe(originalPath)
    })

    it('should prepend existing directories that are not already present', () => {
      process.env[pathKey] = baseEntries.join(separator)
      const missingDirectory = join(tempDirectory, 'missing')

      ensurePathIncludes([tempDirectory, missingDirectory, ''])

      const updated = process.env[pathKey]?.split(separator)

      expect(updated?.[0]).toBe(tempDirectory)
      expect(updated).toEqual(expect.arrayContaining(baseEntries))
      expect(updated).not.toContain(missingDirectory)
    })

    it('should skip directories that already exist', () => {
      const initial = [tempDirectory, ...baseEntries].join(separator)
      process.env[pathKey] = initial

      ensurePathIncludes([tempDirectory])

      expect(process.env[pathKey]).toBe(initial)
    })

    it('should initialize PATH when it was undefined', () => {
      delete process.env[pathKey]

      ensurePathIncludes([tempDirectory])

      expect(process.env[pathKey]).toBe(tempDirectory)
    })
  })

  describe('platform flags', () => {
    it('should reflect the current process platform', () => {
      expect(isWindows).toBe(process.platform === 'win32')
      expect(isMac).toBe(process.platform === 'darwin')
      expect(isLinux).toBe(process.platform === 'linux')
    })
  })

  describe('isPortAvailable', () => {
    it('should return true for available port', async () => {
      const result = await isPortAvailable(0)

      expect(result).toBe(true)
    })

    it('should return false for occupied port', async () => {
      const { createServer } = await import('node:net')
      const server = createServer()

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve())
      })

      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0

      const result = await isPortAvailable(port)

      await new Promise<void>((resolve) => {
        server.close(() => resolve())
      })

      expect(result).toBe(false)
    })
  })

  describe('findAvailablePort', () => {
    let testServer: Server | null = null

    afterEach(async () => {
      if (testServer && testServer.listening) {
        await new Promise<void>((resolve) => {
          testServer?.close(() => resolve())
        })
        testServer = null
      }
    })

    it('should return preferred port when available', async () => {
      const port = await findAvailablePort(9000)

      expect(port).toBeGreaterThanOrEqual(9000)
    })

    it('should find next available port when preferred is occupied', async () => {
      const { createServer } = await import('node:net')
      testServer = createServer()

      // Use port 0 to let OS assign an available port
      await new Promise<void>((resolve) => {
        testServer?.listen(0, '127.0.0.1', () => resolve())
      })

      const address = testServer.address()
      const occupiedPort =
        typeof address === 'object' && address ? address.port : 9100

      const port = await findAvailablePort(occupiedPort)

      expect(port).toBeGreaterThan(occupiedPort)
    })

    it('should use default preferred port 8000', async () => {
      const port = await findAvailablePort()

      expect(port).toBeGreaterThanOrEqual(8000)
    })

    it('should respect maxAttempts parameter', async () => {
      const port = await findAvailablePort(8000, 10)

      expect(port).toBeGreaterThanOrEqual(8000)
      expect(port).toBeLessThan(8010)
    })
  })
})
