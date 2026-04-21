import { $ } from '../zx-config'

const isGitAvailable = async (): Promise<boolean> => {
  try {
    await $`git --version`
    return true
  } catch {
    return false
  }
}

const cloneRepository = async (
  repoUrl: string,
  destination: string,
  branch: string
) => {
  await $`git clone --branch ${branch} --single-branch ${repoUrl} ${destination}`
}

const updateRepository = async (repoPath: string, branch: string) => {
  $.cwd = repoPath
  try {
    await $`git fetch origin ${branch}`
    await $`git checkout ${branch}`
    await $`git reset --hard origin/${branch}`
  } catch (error) {
    throw new Error(`Failed to update repository: ${error}`)
  } finally {
    $.cwd = process.cwd()
  }
}

export { isGitAvailable, cloneRepository, updateRepository }
