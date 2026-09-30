import { $ } from '@scripts/zx-config'
import { BackendStatusEmitter, BackendStatusLevel } from '@types'

export interface EnsureGitOptions {
  emit: BackendStatusEmitter
}

const GIT_INSTALL_MESSAGE =
  'Git is required. Install it using a package manager (macOS: brew install git, Debian/Ubuntu: sudo apt-get install git, Windows: winget install --id Git.Git -e --source winget) and restart the app.'

/**
 * Stops backend setup with an install hint when Git is missing. `uv sync`
 * needs Git because backend/pyproject.toml pulls basicsr from a Git source.
 */
const ensureGit = async ({ emit }: EnsureGitOptions) => {
  emit({
    level: BackendStatusLevel.Info,
    message: 'Checking for Git installation…'
  })

  try {
    await $`git --version`
  } catch {
    emit({ level: BackendStatusLevel.Error, message: GIT_INSTALL_MESSAGE })
    throw new Error('Git is not installed')
  }
}

export { ensureGit, GIT_INSTALL_MESSAGE }
