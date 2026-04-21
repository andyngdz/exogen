import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cloneBackend } from '../clone-backend'
import { ensurePython311 } from '../ensure-python'
import { installDependencies } from '../install-dependencies'
import { installUv } from '../install-uv'
import { runBackend } from '../run-backend'
import { setupVenv } from '../setup-venv'
import { startBackend, type StartBackendOptions } from '../start-backend'
import { BackendStatusLevel } from '@types'
import { createDefaultStatusEmitter, normalizeError } from '../utils'

// Mock all the backend modules
vi.mock('../clone-backend')
vi.mock('../ensure-python')
vi.mock('../install-dependencies')
vi.mock('../install-uv')
vi.mock('../run-backend')
vi.mock('../setup-venv')
vi.mock('../utils')

describe('startBackend', () => {
  const mockOptions: StartBackendOptions = {
    userDataPath: '/test/user/data'
  }

  const mockEmit = vi.fn()
  const mockBackendPath = '/test/backend/path'
  const mockVenvPath = '/test/venv/path'

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default successful mocks
    vi.mocked(createDefaultStatusEmitter).mockReturnValue(mockEmit)
    vi.mocked(cloneBackend).mockResolvedValue({ backendPath: mockBackendPath })
    vi.mocked(setupVenv).mockResolvedValue({
      venvPath: mockVenvPath,
      backendPath: mockBackendPath
    })
    vi.mocked(ensurePython311).mockResolvedValue({
      command: 'python3.11',
      args: [],
      version: '3.11.0',
      minor: 11
    })
    vi.mocked(installUv).mockResolvedValue({
      version: '1.0.0'
    })
    vi.mocked(installDependencies).mockResolvedValue(undefined)
    vi.mocked(runBackend).mockResolvedValue(undefined)
    vi.mocked(normalizeError).mockImplementation((error, defaultMessage) =>
      error instanceof Error ? error : new Error(defaultMessage)
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully complete all backend setup steps in correct order', async () => {
    await startBackend(mockOptions)

    // Verify all steps are called in the correct order
    expect(vi.mocked(ensurePython311)).toHaveBeenCalledWith({ emit: mockEmit })
    expect(vi.mocked(installUv)).toHaveBeenCalledWith({ emit: mockEmit })
    expect(vi.mocked(cloneBackend)).toHaveBeenCalledWith({
      userDataPath: mockOptions.userDataPath,
      emit: mockEmit
    })
    expect(vi.mocked(setupVenv)).toHaveBeenCalledWith({
      userDataPath: mockOptions.userDataPath,
      emit: mockEmit
    })
    expect(vi.mocked(installDependencies)).toHaveBeenCalledWith({
      backendPath: mockBackendPath,
      emit: mockEmit
    })
    expect(vi.mocked(runBackend)).toHaveBeenCalledWith({
      backendPath: mockBackendPath,
      emit: mockEmit
    })

    // Verify no error was emitted
    expect(mockEmit).not.toHaveBeenCalledWith(
      expect.objectContaining({
        level: BackendStatusLevel.Error
      })
    )
  })

  it('should handle error during Python installation step', async () => {
    const testError = new Error('Python installation failed')
    vi.mocked(ensurePython311).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    expect(vi.mocked(normalizeError)).toHaveBeenCalledWith(
      testError,
      'Unknown error'
    )
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: Python installation failed'
    })

    // Verify subsequent steps are not called
    expect(vi.mocked(installUv)).not.toHaveBeenCalled()
    expect(vi.mocked(cloneBackend)).not.toHaveBeenCalled()
  })

  it('should handle error during uv installation step', async () => {
    const testError = new Error('UV installation failed')
    vi.mocked(installUv).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    expect(vi.mocked(ensurePython311)).toHaveBeenCalled()
    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: UV installation failed'
    })

    // Verify subsequent steps are not called
    expect(vi.mocked(cloneBackend)).not.toHaveBeenCalled()
  })

  it('should handle error during backend cloning step', async () => {
    const testError = new Error('Backend cloning failed')
    vi.mocked(cloneBackend).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    expect(vi.mocked(ensurePython311)).toHaveBeenCalled()
    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(vi.mocked(cloneBackend)).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: Backend cloning failed'
    })

    // Verify subsequent steps are not called
    expect(vi.mocked(setupVenv)).not.toHaveBeenCalled()
  })

  it('should handle error during virtual environment setup', async () => {
    const testError = new Error('Virtual environment setup failed')
    vi.mocked(setupVenv).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    expect(vi.mocked(setupVenv)).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: Virtual environment setup failed'
    })

    // Verify subsequent steps are not called
    expect(vi.mocked(installDependencies)).not.toHaveBeenCalled()
  })

  it('should handle error during dependency installation', async () => {
    const testError = new Error('Dependency installation failed')
    vi.mocked(installDependencies).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    // Verify all steps up to installDependencies are called
    expect(vi.mocked(ensurePython311)).toHaveBeenCalled()
    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(vi.mocked(cloneBackend)).toHaveBeenCalled()
    expect(vi.mocked(setupVenv)).toHaveBeenCalled()
    expect(vi.mocked(installDependencies)).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: Dependency installation failed'
    })

    // Verify subsequent steps are not called
    expect(vi.mocked(runBackend)).not.toHaveBeenCalled()
  })

  it('should handle error during backend execution', async () => {
    const testError = new Error('Backend execution failed')
    vi.mocked(runBackend).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    // Verify all steps up to runBackend are called
    expect(vi.mocked(ensurePython311)).toHaveBeenCalled()
    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(vi.mocked(cloneBackend)).toHaveBeenCalled()
    expect(vi.mocked(setupVenv)).toHaveBeenCalled()
    expect(vi.mocked(installDependencies)).toHaveBeenCalled()
    expect(vi.mocked(runBackend)).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: Backend execution failed'
    })
  })

  it('should handle non-Error objects thrown as exceptions', async () => {
    const testError = 'String error message'
    const normalizedError = new Error('Unknown error')
    vi.mocked(ensurePython311).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(normalizedError)

    await startBackend(mockOptions)

    expect(vi.mocked(normalizeError)).toHaveBeenCalledWith(
      testError,
      'Unknown error'
    )
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: Unknown error'
    })
  })

  it('should create status emitter once and reuse it across all steps', async () => {
    await startBackend(mockOptions)

    expect(vi.mocked(createDefaultStatusEmitter)).toHaveBeenCalledTimes(1)

    // Verify the same emit function is passed to all steps
    const expectedEmitArg = { emit: mockEmit }
    expect(vi.mocked(ensurePython311)).toHaveBeenCalledWith(expectedEmitArg)
    expect(vi.mocked(installUv)).toHaveBeenCalledWith(expectedEmitArg)
    expect(vi.mocked(cloneBackend)).toHaveBeenCalledWith({
      userDataPath: mockOptions.userDataPath,
      ...expectedEmitArg
    })
    expect(vi.mocked(setupVenv)).toHaveBeenCalledWith({
      userDataPath: mockOptions.userDataPath,
      ...expectedEmitArg
    })
  })

  it('should pass correct userDataPath to relevant steps', async () => {
    const customUserDataPath = '/custom/user/data/path'
    const customOptions: StartBackendOptions = {
      userDataPath: customUserDataPath
    }

    await startBackend(customOptions)

    expect(vi.mocked(cloneBackend)).toHaveBeenCalledWith({
      userDataPath: customUserDataPath,
      emit: mockEmit
    })
    expect(vi.mocked(setupVenv)).toHaveBeenCalledWith({
      userDataPath: customUserDataPath,
      emit: mockEmit
    })
  })

  it('should pass backend and venv paths correctly between steps', async () => {
    const customBackendPath = '/custom/backend/path'
    const customVenvPath = '/custom/venv/path'

    vi.mocked(cloneBackend).mockResolvedValue({
      backendPath: customBackendPath
    })
    vi.mocked(setupVenv).mockResolvedValue({
      venvPath: customVenvPath,
      backendPath: customBackendPath
    })

    await startBackend(mockOptions)

    expect(vi.mocked(installDependencies)).toHaveBeenCalledWith({
      backendPath: customBackendPath,
      emit: mockEmit
    })
    expect(vi.mocked(runBackend)).toHaveBeenCalledWith({
      backendPath: customBackendPath,
      emit: mockEmit
    })
  })
})
