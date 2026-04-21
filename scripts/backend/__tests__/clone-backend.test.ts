import { BackendStatusLevel } from '@types'
import path from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cloneBackend } from '../clone-backend'
import { BACKEND_BRANCH, BACKEND_DIRNAME, BACKEND_REPO_URL } from '../constants'
import * as gitModule from '../git'
import * as utilsModule from '../utils'

// Mock dependencies
vi.mock('../git')
vi.mock('../utils')

const mockIsGitAvailable = vi.mocked(gitModule.isGitAvailable)
const mockCloneRepository = vi.mocked(gitModule.cloneRepository)
const mockUpdateRepository = vi.mocked(gitModule.updateRepository)
const mockPathExists = vi.mocked(utilsModule.pathExists)

describe('cloneBackend', () => {
  const mockUserDataPath = '/test/user/data'
  const expectedBackendPath = path.join(mockUserDataPath, BACKEND_DIRNAME)
  const mockEmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when Git is not available', () => {
    it('should throw error and emit installation message when Git is not installed', async () => {
      mockIsGitAvailable.mockResolvedValue(false)

      await expect(
        cloneBackend({ userDataPath: mockUserDataPath, emit: mockEmit })
      ).rejects.toThrow('Git is not installed')

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Checking for Git installation…'
      })

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: expect.stringContaining(
          'Git is required. Install it using a package manager'
        )
      })
    })
  })

  describe('when backend directory does not exist', () => {
    it('should clone repository successfully', async () => {
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockResolvedValue(false)
      mockCloneRepository.mockResolvedValue()

      const result = await cloneBackend({
        userDataPath: mockUserDataPath,
        emit: mockEmit
      })

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Checking for Git installation…'
      })

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Cloning ExoGen backend repository…'
      })

      expect(mockCloneRepository).toHaveBeenCalledWith(
        BACKEND_REPO_URL,
        expectedBackendPath,
        BACKEND_BRANCH
      )

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Backend repository cloned successfully.'
      })

      expect(result).toEqual({ backendPath: expectedBackendPath })
    })
  })

  describe('when backend directory exists', () => {
    beforeEach(() => {
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockImplementation((filePath) => {
        // Backend directory exists, but check for .git directory
        if (filePath === expectedBackendPath) return Promise.resolve(true)
        if (filePath === path.join(expectedBackendPath, '.git'))
          return Promise.resolve(true)
        return Promise.resolve(false)
      })
    })

    it('should update repository when it is a valid Git repository', async () => {
      mockUpdateRepository.mockResolvedValue()

      const result = await cloneBackend({
        userDataPath: mockUserDataPath,
        emit: mockEmit
      })

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Fetching the latest backend changes…'
      })

      expect(mockUpdateRepository).toHaveBeenCalledWith(
        expectedBackendPath,
        BACKEND_BRANCH
      )

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Info,
        message: 'Backend repository updated successfully.'
      })

      expect(result).toEqual({ backendPath: expectedBackendPath })
    })

    it('should throw error when directory exists but is not a Git repository', async () => {
      mockPathExists.mockImplementation((filePath) => {
        if (filePath === expectedBackendPath) return Promise.resolve(true)
        if (filePath.endsWith('.git')) return Promise.resolve(false)
        return Promise.resolve(false)
      })

      await expect(
        cloneBackend({ userDataPath: mockUserDataPath, emit: mockEmit })
      ).rejects.toThrow('Backend directory is not a Git repository')

      expect(mockEmit).toHaveBeenCalledWith({
        level: BackendStatusLevel.Error,
        message:
          'The backend directory exists but is not a Git repository. Remove it manually and restart the app.'
      })
    })
  })

  describe('error handling', () => {
    it('should handle clone repository errors', async () => {
      const cloneError = new Error('Clone failed')
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockResolvedValue(false)
      mockCloneRepository.mockRejectedValue(cloneError)

      await expect(
        cloneBackend({ userDataPath: mockUserDataPath, emit: mockEmit })
      ).rejects.toThrow('Clone failed')
    })

    it('should handle update repository errors', async () => {
      const updateError = new Error('Update failed')
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockImplementation((filePath) => {
        if (filePath === expectedBackendPath) return Promise.resolve(true)
        if (filePath.endsWith('.git')) return Promise.resolve(true)
        return Promise.resolve(false)
      })
      mockUpdateRepository.mockRejectedValue(updateError)

      await expect(
        cloneBackend({ userDataPath: mockUserDataPath, emit: mockEmit })
      ).rejects.toThrow('Update failed')
    })

    it('should handle pathExists errors', async () => {
      const pathError = new Error('Path check failed')
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockRejectedValue(pathError)

      await expect(
        cloneBackend({ userDataPath: mockUserDataPath, emit: mockEmit })
      ).rejects.toThrow('Path check failed')
    })
  })

  describe('edge cases', () => {
    it('should handle empty userDataPath', async () => {
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockResolvedValue(false)
      mockCloneRepository.mockResolvedValue()

      const result = await cloneBackend({
        userDataPath: '',
        emit: mockEmit
      })

      const expectedPath = path.join('', BACKEND_DIRNAME)
      expect(mockCloneRepository).toHaveBeenCalledWith(
        BACKEND_REPO_URL,
        expectedPath,
        BACKEND_BRANCH
      )
      expect(result).toEqual({ backendPath: expectedPath })
    })

    it('should handle userDataPath with special characters', async () => {
      const specialPath = '/test/path with spaces/special-chars_123'
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockResolvedValue(false)
      mockCloneRepository.mockResolvedValue()

      const result = await cloneBackend({
        userDataPath: specialPath,
        emit: mockEmit
      })

      const expectedPath = path.join(specialPath, BACKEND_DIRNAME)
      expect(mockCloneRepository).toHaveBeenCalledWith(
        BACKEND_REPO_URL,
        expectedPath,
        BACKEND_BRANCH
      )
      expect(result).toEqual({ backendPath: expectedPath })
    })
  })

  describe('emit function calls', () => {
    it('should call emit function with correct parameters throughout the flow', async () => {
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockResolvedValue(false)
      mockCloneRepository.mockResolvedValue()

      await cloneBackend({
        userDataPath: mockUserDataPath,
        emit: mockEmit
      })

      // Verify all emit calls in order
      expect(mockEmit).toHaveBeenNthCalledWith(1, {
        level: BackendStatusLevel.Info,
        message: 'Checking for Git installation…'
      })

      expect(mockEmit).toHaveBeenNthCalledWith(2, {
        level: BackendStatusLevel.Info,
        message: 'Cloning ExoGen backend repository…'
      })

      expect(mockEmit).toHaveBeenNthCalledWith(3, {
        level: BackendStatusLevel.Info,
        message: 'Backend repository cloned successfully.'
      })

      expect(mockEmit).toHaveBeenCalledTimes(3)
    })

    it('should call emit function correctly during repository update flow', async () => {
      mockIsGitAvailable.mockResolvedValue(true)
      mockPathExists.mockImplementation((filePath) => {
        if (filePath === expectedBackendPath) return Promise.resolve(true)
        if (filePath.endsWith('.git')) return Promise.resolve(true)
        return Promise.resolve(false)
      })
      mockUpdateRepository.mockResolvedValue()

      await cloneBackend({
        userDataPath: mockUserDataPath,
        emit: mockEmit
      })

      expect(mockEmit).toHaveBeenNthCalledWith(1, {
        level: BackendStatusLevel.Info,
        message: 'Checking for Git installation…'
      })

      expect(mockEmit).toHaveBeenNthCalledWith(2, {
        level: BackendStatusLevel.Info,
        message: 'Fetching the latest backend changes…'
      })

      expect(mockEmit).toHaveBeenNthCalledWith(3, {
        level: BackendStatusLevel.Info,
        message: 'Backend repository updated successfully.'
      })

      expect(mockEmit).toHaveBeenCalledTimes(3)
    })
  })
})
