import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installDependencies } from '../install-dependencies'
import { installUv } from '../install-uv'
import { runBackend } from '../run-backend'
import { setupVenv } from '../setup-venv'
import { syncBackend } from '../sync-backend'
import { startBackend, type StartBackendOptions } from '../start-backend'
import { BackendStatusLevel } from '@types'
import { createDefaultStatusEmitter, normalizeError } from '../utils'

// Mock all the backend modules
vi.mock('../sync-backend')
vi.mock('../ensure-git')
vi.mock('../install-dependencies')
vi.mock('../install-uv')
vi.mock('../run-backend')
vi.mock('../setup-venv')
vi.mock('../utils')

describe('startBackend', () => {
  const mockOptions: StartBackendOptions = {
    userDataPath: '/test/user/data',
    backendSourcePath: '/test/resources/backend',
    appVersion: '1.2.3'
  }

  const mockEmit = vi.fn()
  const mockBackendPath = '/test/backend/path'
  const mockVenvPath = '/test/venv/path'

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default successful mocks
    vi.mocked(createDefaultStatusEmitter).mockReturnValue(mockEmit)
    vi.mocked(syncBackend).mockResolvedValue({ backendPath: mockBackendPath })
    vi.mocked(setupVenv).mockResolvedValue({
      venvPath: mockVenvPath,
      backendPath: mockBackendPath
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
    expect(vi.mocked(installUv)).toHaveBeenCalledWith({ emit: mockEmit })
    expect(vi.mocked(syncBackend)).toHaveBeenCalledWith({
      sourcePath: mockOptions.backendSourcePath,
      backendPath: '/test/user/data/exogen_backend',
      version: mockOptions.appVersion,
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

  it('should handle error during uv installation step', async () => {
    const testError = new Error('UV installation failed')
    vi.mocked(installUv).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: UV installation failed'
    })

    // Verify subsequent steps are not called
    expect(vi.mocked(syncBackend)).not.toHaveBeenCalled()
  })

  it('should handle error during backend cloning step', async () => {
    const testError = new Error('Backend cloning failed')
    vi.mocked(syncBackend).mockRejectedValue(testError)
    vi.mocked(normalizeError).mockReturnValue(testError)

    await startBackend(mockOptions)

    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(vi.mocked(syncBackend)).toHaveBeenCalled()
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
    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(vi.mocked(syncBackend)).toHaveBeenCalled()
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
    expect(vi.mocked(installUv)).toHaveBeenCalled()
    expect(vi.mocked(syncBackend)).toHaveBeenCalled()
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
    vi.mocked(installUv).mockRejectedValue(testError)
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
    expect(vi.mocked(installUv)).toHaveBeenCalledWith(expectedEmitArg)
    expect(vi.mocked(syncBackend)).toHaveBeenCalledWith({
      sourcePath: mockOptions.backendSourcePath,
      backendPath: '/test/user/data/exogen_backend',
      version: mockOptions.appVersion,
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
      userDataPath: customUserDataPath,
      backendSourcePath: '/custom/repo/backend'
    }

    await startBackend(customOptions)

    expect(vi.mocked(syncBackend)).toHaveBeenCalledWith({
      sourcePath: '/custom/repo/backend',
      backendPath: '/custom/user/data/path/exogen_backend',
      version: undefined,
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

    vi.mocked(syncBackend).mockResolvedValue({
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
