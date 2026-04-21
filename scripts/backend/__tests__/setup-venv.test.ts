import { BackendStatusLevel } from '@types'
import * as path from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BACKEND_DIRNAME } from '../constants'
import { setupVenv } from '../setup-venv'
import * as utilsModule from '../utils'

// Mock dependencies
const mock$ = vi.fn()
vi.mock('zx', () => ({
  $: (...args: unknown[]) => mock$(...args),
  usePowerShell: vi.fn()
}))
vi.mock('../utils')

const mockPathExists = vi.mocked(utilsModule.pathExists)

describe('setupVenv', () => {
  const mockUserDataPath = '/test/user/data'
  const expectedBackendPath = path.join(mockUserDataPath, BACKEND_DIRNAME)
  const expectedVenvPath = path.join(expectedBackendPath, '.venv')
  const mockEmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mock$.mockReset()

    // Setup default successful mocks - backend directory exists
    mockPathExists.mockImplementation((targetPath) => {
      if (targetPath === expectedBackendPath) return Promise.resolve(true)
      return Promise.resolve(false)
    })
  })

  describe('successful verification', () => {
    it('should verify backend directory and return paths', async () => {
      const result = await setupVenv({
        userDataPath: mockUserDataPath,
        emit: mockEmit
      })

      // Verify backend directory existence check
      expect(mockPathExists).toHaveBeenCalledWith(expectedBackendPath)

      // Verify status message about uv sync managing venv
      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message:
          'Backend directory verified. Virtual environment will be managed by uv sync.'
      })

      // Should not attempt to create venv manually
      expect(mock$).not.toHaveBeenCalled()

      // Verify return value includes both paths
      expect(result).toEqual({
        venvPath: expectedVenvPath,
        backendPath: expectedBackendPath
      })

      expect(mockEmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should throw error when backend directory does not exist', async () => {
      mockPathExists.mockImplementation((targetPath) => {
        if (targetPath === expectedBackendPath) return Promise.resolve(false)
        return Promise.resolve(false)
      })

      await expect(
        setupVenv({
          userDataPath: mockUserDataPath,
          emit: mockEmit
        })
      ).rejects.toThrow('Backend directory not found')

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message: 'Backend directory not found. Clone the backend first.'
      })

      expect(mockPathExists).toHaveBeenCalledWith(expectedBackendPath)
      expect(mock$).not.toHaveBeenCalled()
    })

    it('should handle pathExists errors for backend directory', async () => {
      const pathError = new Error('File system error')
      mockPathExists.mockImplementation((targetPath) => {
        if (targetPath === expectedBackendPath) return Promise.reject(pathError)
        return Promise.resolve(false)
      })

      await expect(
        setupVenv({
          userDataPath: mockUserDataPath,
          emit: mockEmit
        })
      ).rejects.toThrow('File system error')

      expect(mockEmit).not.toHaveBeenCalled()
      expect(mock$).not.toHaveBeenCalled()
    })
  })

  describe('path construction', () => {
    it('should construct correct paths with different userDataPath', async () => {
      const customUserDataPath = '/custom/user/data'
      const customBackendPath = path.join(customUserDataPath, BACKEND_DIRNAME)
      const customVenvPath = path.join(customBackendPath, '.venv')

      mockPathExists.mockImplementation((targetPath) => {
        if (targetPath === customBackendPath) return Promise.resolve(true)
        return Promise.resolve(false)
      })

      const result = await setupVenv({
        userDataPath: customUserDataPath,
        emit: mockEmit
      })

      expect(mockPathExists).toHaveBeenCalledWith(customBackendPath)
      expect(result).toEqual({
        venvPath: customVenvPath,
        backendPath: customBackendPath
      })
    })

    it('should handle Windows-style paths', async () => {
      const windowsPath = 'C:\\Users\\test\\data'
      const windowsBackendPath = path.join(windowsPath, BACKEND_DIRNAME)
      const windowsVenvPath = path.join(windowsBackendPath, '.venv')

      mockPathExists.mockImplementation((targetPath) => {
        if (targetPath === windowsBackendPath) return Promise.resolve(true)
        return Promise.resolve(false)
      })

      const result = await setupVenv({
        userDataPath: windowsPath,
        emit: mockEmit
      })

      expect(result).toEqual({
        venvPath: windowsVenvPath,
        backendPath: windowsBackendPath
      })
    })
  })
})
