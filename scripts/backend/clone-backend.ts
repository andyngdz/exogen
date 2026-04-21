import { BackendStatusEmitter, BackendStatusLevel } from '@types'
import * as path from 'node:path'
import { BACKEND_BRANCH, BACKEND_DIRNAME, BACKEND_REPO_URL } from './constants'
import { cloneRepository, isGitAvailable, updateRepository } from './git'
import { pathExists } from './utils'

export interface SetupBackendOptions {
  userDataPath: string
  emit: BackendStatusEmitter
}

const ensureGitRepository = async (repositoryPath: string) => {
  const gitDirectory = path.join(repositoryPath, '.git')
  return pathExists(gitDirectory)
}

const cloneBackend = async ({ userDataPath, emit }: SetupBackendOptions) => {
  emit({
    level: BackendStatusLevel.Info,
    message: 'Checking for Git installation…'
  })

  const hasGit = await isGitAvailable()

  if (!hasGit) {
    emit({
      level: BackendStatusLevel.Info,
      message:
        'Git is required. Install it using a package manager (macOS: brew install git, Debian/Ubuntu: sudo apt-get install git, Windows: winget install --id Git.Git -e --source winget) and restart the app.'
    })

    throw new Error('Git is not installed')
  }

  const backendPath = path.join(userDataPath, BACKEND_DIRNAME)
  const backendExists = await pathExists(backendPath)

  if (!backendExists) {
    emit({
      level: BackendStatusLevel.Info,
      message: 'Cloning ExoGen backend repository…'
    })
    await cloneRepository(BACKEND_REPO_URL, backendPath, BACKEND_BRANCH)
    emit({
      level: BackendStatusLevel.Info,
      message: 'Backend repository cloned successfully.'
    })
    return { backendPath }
  }

  const isRepo = await ensureGitRepository(backendPath)

  if (!isRepo) {
    emit({
      level: BackendStatusLevel.Error,
      message:
        'The backend directory exists but is not a Git repository. Remove it manually and restart the app.'
    })

    throw new Error('Backend directory is not a Git repository')
  }

  emit({
    level: BackendStatusLevel.Info,
    message: 'Fetching the latest backend changes…'
  })
  await updateRepository(backendPath, BACKEND_BRANCH)
  emit({
    level: BackendStatusLevel.Info,
    message: 'Backend repository updated successfully.'
  })

  return { backendPath }
}

export { cloneBackend, ensureGitRepository }
