import path from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runBackend, stopBackend, getBackendPort } from '../run-backend'
import { BackendStatusLevel } from '@types'
import * as utilsModule from '../utils'
import { EventEmitter } from 'events'

// Mock tree-kill
const mockTreeKill = vi.fn()
let mockTreeKillError: Error | undefined = undefined
vi.mock('tree-kill', () => ({
  default: (pid: number, signal: string, callback: (err?: Error) => void) => {
    mockTreeKill(pid, signal)
    callback(mockTreeKillError)
  }
}))

// Mock dependencies
const mockStdout = new EventEmitter()
const mockStderr = new EventEmitter()
const mockChildProcess: { pid?: number; kill: ReturnType<typeof vi.fn> } = {
  pid: 12345,
  kill: vi.fn()
}
const mockProcessInstance: {
  stdout: EventEmitter
  stderr: EventEmitter
  catch: ReturnType<typeof vi.fn>
  child?: { pid?: number; kill: ReturnType<typeof vi.fn> }
} = {
  stdout: mockStdout,
  stderr: mockStderr,
  catch: vi.fn(),
  child: mockChildProcess
}

const mock$ = vi.fn()
vi.mock('zx', () => ({
  $: (...args: unknown[]) => mock$(...args),
  usePowerShell: vi.fn()
}))
vi.mock('../utils')

const mockPathExists = vi.mocked(utilsModule.pathExists)
const mockNormalizeError = vi.mocked(utilsModule.normalizeError)
const mockFindAvailablePort = vi.mocked(utilsModule.findAvailablePort)

describe('runBackend', () => {
  const mockBackendPath = '/test/backend'
  const mockEmit = vi.fn()

  beforeEach(async () => {
    // Stop any backend from previous tests
    await stopBackend()

    vi.clearAllMocks()
    mock$.mockReset()
    mockTreeKill.mockReset()
    mockTreeKillError = undefined
    mockStdout.removeAllListeners()
    mockStderr.removeAllListeners()
    mockProcessInstance.catch.mockClear()
    mockChildProcess.kill.mockClear()
    mockChildProcess.pid = 12345
    mockProcessInstance.child = mockChildProcess

    // Setup default successful mocks
    mockPathExists.mockResolvedValue(true)
    mockFindAvailablePort.mockResolvedValue(8000)
    mock$.mockReturnValue(mockProcessInstance)
    mockProcessInstance.catch.mockReturnValue(mockProcessInstance)
    mockNormalizeError.mockImplementation((error, defaultMessage) =>
      error instanceof Error ? error : new Error(defaultMessage)
    )

    // Mock process.chdir to avoid changing actual directory
    vi.spyOn(process, 'chdir').mockImplementation(() => {})

    // Mock console methods to avoid test output pollution
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('successful backend startup', () => {
    it('should start ExoGen Backend successfully when main.py exists', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      // Verify main.py existence check
      expect(mockPathExists).toHaveBeenCalledWith(
        path.join(mockBackendPath, 'main.py')
      )

      // Verify port finding
      expect(mockFindAvailablePort).toHaveBeenCalledWith(8000)

      // Verify status emissions
      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Finding available port for backend…'
      })

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Starting ExoGen Backend on port 8000…'
      })

      // Verify uvicorn command execution
      expect(mock$).toHaveBeenCalledTimes(1)

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'ExoGen Backend is starting'
      })

      expect(mockEmit).toHaveBeenCalledTimes(3)
    })

    it('should setup stdout stream listener', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockStdout.listenerCount('data')).toBe(1)
    })

    it('should setup stderr stream listener', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockStderr.listenerCount('data')).toBe(1)
    })

    it('should setup error handler for uvicorn process', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockProcessInstance.catch).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should throw error when main.py does not exist', async () => {
      mockPathExists.mockResolvedValue(false)

      await expect(
        runBackend({
          backendPath: mockBackendPath,
          emit: mockEmit
        })
      ).rejects.toThrow('main.py not found')

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message:
          'main.py not found in backend directory. Try restarting the application.'
      })

      // Should not attempt to start uvicorn
      expect(mock$).not.toHaveBeenCalled()
    })

    it('should handle uvicorn startup failure', async () => {
      const startupError = new Error('uvicorn failed to start')
      mock$.mockImplementation(() => {
        throw startupError
      })
      mockNormalizeError.mockReturnValue(startupError)

      await expect(
        runBackend({
          backendPath: mockBackendPath,
          emit: mockEmit
        })
      ).rejects.toThrow('uvicorn failed to start')

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Finding available port for backend…'
      })

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message:
          'Failed to start ExoGen Backend. Please restart the application.'
      })

      expect(mockNormalizeError).toHaveBeenCalledWith(
        startupError,
        'Failed to start ExoGen Backend'
      )
    })

    it('should handle pathExists errors', async () => {
      const pathError = new Error('File system error')
      mockPathExists.mockRejectedValue(pathError)

      await expect(
        runBackend({
          backendPath: mockBackendPath,
          emit: mockEmit
        })
      ).rejects.toThrow('File system error')

      // Should not emit any status messages
      expect(mockEmit).not.toHaveBeenCalled()
      expect(mock$).not.toHaveBeenCalled()
    })

    it('should normalize non-Error objects thrown by uvicorn command', async () => {
      const stringError = 'String error message'
      const normalizedError = new Error('Failed to start ExoGen Backend')
      mock$.mockImplementation(() => {
        throw stringError
      })
      mockNormalizeError.mockReturnValue(normalizedError)

      await expect(
        runBackend({
          backendPath: mockBackendPath,
          emit: mockEmit
        })
      ).rejects.toThrow('Failed to start ExoGen Backend')

      expect(mockNormalizeError).toHaveBeenCalledWith(
        stringError,
        'Failed to start ExoGen Backend'
      )
    })

    it('should handle findAvailablePort errors', async () => {
      const portError = new Error('Port finding failed')
      mockFindAvailablePort.mockRejectedValue(portError)

      await expect(
        runBackend({
          backendPath: mockBackendPath,
          emit: mockEmit
        })
      ).rejects.toThrow('Port finding failed')

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message:
          'Failed to start ExoGen Backend. Please restart the application.'
      })
    })

    it('should setup catch handler for backend process errors', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockProcessInstance.catch).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })

    it('should emit error when backend process fails', async () => {
      const processError = new Error('Process failed')
      mockProcessInstance.catch.mockImplementation(async (callback) => {
        await callback(processError)
      })

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message: 'Backend process failed. Please restart the application.'
      })
    })
  })

  describe('command execution', () => {
    it('should use correct uvicorn command with backendPath', async () => {
      const customBackendPath = '/custom/path/to/backend'

      await runBackend({
        backendPath: customBackendPath,
        emit: mockEmit
      })

      // Verify main.py path check
      expect(mockPathExists).toHaveBeenCalledWith(
        path.join(customBackendPath, 'main.py')
      )

      // Verify uvicorn command was called
      expect(mock$).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty backendPath', async () => {
      const emptyPath = ''

      await runBackend({
        backendPath: emptyPath,
        emit: mockEmit
      })

      expect(mockPathExists).toHaveBeenCalledWith(
        path.join(emptyPath, 'main.py')
      )

      expect(mock$).toHaveBeenCalledTimes(1)
    })

    it('should handle paths with spaces and special characters', async () => {
      const specialPath = '/path with spaces/special-chars_123'

      await runBackend({
        backendPath: specialPath,
        emit: mockEmit
      })

      expect(mockPathExists).toHaveBeenCalledWith(
        path.join(specialPath, 'main.py')
      )

      expect(mock$).toHaveBeenCalledTimes(1)
    })

    it('should handle relative paths correctly', async () => {
      const relativePath = './backend'

      await runBackend({
        backendPath: relativePath,
        emit: mockEmit
      })

      expect(mockPathExists).toHaveBeenCalledWith(
        path.join(relativePath, 'main.py')
      )

      expect(mock$).toHaveBeenCalledTimes(1)
    })
  })

  describe('main.py path construction', () => {
    it('should construct correct main.py path with path.join', async () => {
      const backendPath = '/test/backend/path'

      await runBackend({
        backendPath,
        emit: mockEmit
      })

      expect(mockPathExists).toHaveBeenCalledWith(
        path.join(backendPath, 'main.py')
      )
    })

    it('should handle Windows-style paths', async () => {
      const windowsPath = 'C:\\Users\\test\\backend'

      await runBackend({
        backendPath: windowsPath,
        emit: mockEmit
      })

      expect(mockPathExists).toHaveBeenCalledWith(
        path.join(windowsPath, 'main.py')
      )
    })
  })

  describe('emit function calls', () => {
    it('should emit correct sequence of status messages for successful startup', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockEmit).toHaveBeenNthCalledWith(1, {
        level: BackendStatusLevel.Info,
        message: 'Finding available port for backend…'
      })

      expect(mockEmit).toHaveBeenNthCalledWith(2, {
        level: BackendStatusLevel.Info,
        message: 'Starting ExoGen Backend on port 8000…'
      })

      expect(mockEmit).toHaveBeenNthCalledWith(3, {
        level: BackendStatusLevel.Info,
        message: 'ExoGen Backend is starting'
      })

      expect(mockEmit).toHaveBeenCalledTimes(3)
    })

    it('should emit correct sequence for main.py not found error', async () => {
      mockPathExists.mockResolvedValue(false)

      await expect(
        runBackend({
          backendPath: mockBackendPath,
          emit: mockEmit
        })
      ).rejects.toThrow()

      expect(mockEmit).toHaveBeenCalledTimes(1)
      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message:
          'main.py not found in backend directory. Try restarting the application.'
      })
    })
  })

  describe('log streaming', () => {
    it('should log stdout data to console.info', async () => {
      const consoleInfoSpy = vi
        .spyOn(console, 'info')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStdout.emit('data', Buffer.from('Server started on port 8000'))

      expect(consoleInfoSpy).toHaveBeenCalledWith('Server started on port 8000')
    })

    it('should log stderr data to console.info if no ERROR keyword', async () => {
      const consoleInfoSpy = vi
        .spyOn(console, 'info')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStderr.emit('data', Buffer.from('Warning: deprecated API'))

      expect(consoleInfoSpy).toHaveBeenCalledWith('Warning: deprecated API')
    })

    it('should log stdout ERROR messages to console.error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStdout.emit('data', Buffer.from('ERROR: Connection failed'))

      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: Connection failed')
    })

    it('should log stderr ERROR messages to console.error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStderr.emit('data', Buffer.from('ERROR: Database connection lost'))

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ERROR: Database connection lost'
      )
    })

    it('should trim whitespace from log output', async () => {
      const consoleInfoSpy = vi
        .spyOn(console, 'info')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStdout.emit('data', Buffer.from('  Test message  \n'))

      expect(consoleInfoSpy).toHaveBeenCalledWith('Test message')
    })

    it('should not log empty strings', async () => {
      const consoleInfoSpy = vi
        .spyOn(console, 'info')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStdout.emit('data', Buffer.from('   \n\n   '))

      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('should handle multiple log lines', async () => {
      const consoleInfoSpy = vi
        .spyOn(console, 'info')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStdout.emit('data', Buffer.from('Line 1'))
      mockStdout.emit('data', Buffer.from('Line 2'))
      mockStderr.emit('data', Buffer.from('Line 3'))

      expect(consoleInfoSpy).toHaveBeenCalledTimes(3)
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'Line 1')
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, 'Line 2')
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(3, 'Line 3')
    })

    it('should log error messages to console.error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockStdout.emit('data', Buffer.from('ERROR: Something went wrong'))

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ERROR: Something went wrong'
      )
    })
  })

  describe('uvicorn command verification', () => {
    it('should verify uvicorn command execution', async () => {
      let commandExecuted = false
      mock$.mockImplementation(() => {
        commandExecuted = true
        return mockProcessInstance
      })

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(commandExecuted).toBe(true)
      expect(mock$).toHaveBeenCalledTimes(1)
    })

    it('should handle uvicorn command timeout or hanging', async () => {
      const timeoutError = new Error('Command timeout')
      mock$.mockImplementation(() => {
        throw timeoutError
      })
      mockNormalizeError.mockReturnValue(timeoutError)

      await expect(
        runBackend({
          backendPath: mockBackendPath,
          emit: mockEmit
        })
      ).rejects.toThrow('Command timeout')

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message:
          'Failed to start ExoGen Backend. Please restart the application.'
      })
    })
  })

  describe('concurrent operations', () => {
    it('should handle multiple concurrent runBackend calls', async () => {
      const emit1 = vi.fn()
      const emit2 = vi.fn()
      const emit3 = vi.fn()

      const promises = [
        runBackend({ backendPath: '/path1', emit: emit1 }),
        runBackend({ backendPath: '/path2', emit: emit2 }),
        runBackend({ backendPath: '/path3', emit: emit3 })
      ]

      await Promise.all(promises)

      // Each call should check for main.py
      expect(mockPathExists).toHaveBeenCalledTimes(3)
      // Each call should execute uvicorn
      expect(mock$).toHaveBeenCalledTimes(3)
      // Each call should emit 3 status messages (finding port + start + success)
      expect(emit1).toHaveBeenCalledTimes(3)
      expect(emit2).toHaveBeenCalledTimes(3)
      expect(emit3).toHaveBeenCalledTimes(3)
    })

    it('should handle mixed success and failure scenarios', async () => {
      const emit1 = vi.fn()
      const emit2 = vi.fn()
      const emit3 = vi.fn()

      mockPathExists
        .mockResolvedValueOnce(true) // First call succeeds
        .mockResolvedValueOnce(false) // Second call fails
        .mockResolvedValueOnce(true) // Third call succeeds

      const promises = [
        runBackend({ backendPath: '/path1', emit: emit1 }),
        runBackend({ backendPath: '/path2', emit: emit2 }).catch(() => {}), // Catch to prevent unhandled rejection
        runBackend({ backendPath: '/path3', emit: emit3 })
      ]

      await Promise.all(promises)

      expect(mockPathExists).toHaveBeenCalledTimes(3)
      expect(mock$).toHaveBeenCalledTimes(2) // Only successful calls execute uvicorn
    })
  })

  describe('process.chdir', () => {
    it('should change directory to backendPath before running uvicorn', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(process.chdir).toHaveBeenCalledWith(mockBackendPath)
    })
  })

  describe('dynamic port allocation', () => {
    it('should find available port starting from 8000', async () => {
      mockFindAvailablePort.mockResolvedValue(8001)

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockFindAvailablePort).toHaveBeenCalledWith(8000)
      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Starting ExoGen Backend on port 8001…'
      })
    })

    it('should use port returned by findAvailablePort', async () => {
      mockFindAvailablePort.mockResolvedValue(8005)

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(getBackendPort()).toBe(8005)
    })
  })

  describe('stopBackend', () => {
    it('should call tree-kill with correct options', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      await stopBackend()

      expect(mockTreeKill).toHaveBeenCalledWith(12345, 'SIGTERM')
    })

    it('should reset port to 8000 after stopping', async () => {
      mockFindAvailablePort.mockResolvedValue(8002)

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(getBackendPort()).toBe(8002)

      await stopBackend()

      expect(getBackendPort()).toBe(8000)
    })

    it('should not throw when stopping non-existent process', async () => {
      await expect(stopBackend()).resolves.not.toThrow()
    })

    it('should handle tree-kill errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      // Set error for next tree-kill call
      mockTreeKillError = new Error('Kill failed')

      await stopBackend()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to stop backend process:',
        expect.any(Error)
      )

      // Verify port is reset even on error
      expect(getBackendPort()).toBe(8000)
    })

    it('should handle missing child process gracefully', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      // Remove child process
      delete mockProcessInstance.child

      // Clear mock to only check stopBackend call
      mockTreeKill.mockClear()

      await expect(stopBackend()).resolves.not.toThrow()
      expect(mockTreeKill).not.toHaveBeenCalled()
    })

    it('should handle missing PID gracefully', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      // Remove PID
      delete mockChildProcess.pid

      // Clear mock to only check stopBackend call
      mockTreeKill.mockClear()

      await expect(stopBackend()).resolves.not.toThrow()
      expect(mockTreeKill).not.toHaveBeenCalled()
    })
  })

  describe('getBackendPort', () => {
    it('should return default port 8000 initially', () => {
      expect(getBackendPort()).toBe(8000)
    })

    it('should return current backend port after startup', async () => {
      mockFindAvailablePort.mockResolvedValue(8003)

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(getBackendPort()).toBe(8003)
    })
  })

  describe('process cleanup guard', () => {
    it('should stop existing process before starting new one', async () => {
      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      mockTreeKill.mockClear()

      await runBackend({
        backendPath: mockBackendPath,
        emit: mockEmit
      })

      expect(mockTreeKill).toHaveBeenCalledTimes(1)
    })

    it('should prevent process leaks on multiple calls', async () => {
      await runBackend({ backendPath: '/path1', emit: mockEmit })

      mockTreeKill.mockClear()

      await runBackend({ backendPath: '/path2', emit: mockEmit })
      expect(mockTreeKill).toHaveBeenCalledTimes(1)

      mockTreeKill.mockClear()

      await runBackend({ backendPath: '/path3', emit: mockEmit })
      expect(mockTreeKill).toHaveBeenCalledTimes(1)
    })
  })
})
