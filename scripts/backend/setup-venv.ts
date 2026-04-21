import { BackendStatusEmitter, BackendStatusLevel } from '@types'
import * as path from 'node:path'
import { $ } from '../zx-config'
import { BACKEND_DIRNAME } from './constants'
import { pathExists } from './utils'

export interface SetupVenvOptions {
  userDataPath: string
  emit: BackendStatusEmitter
}

export interface VenvInfo {
  venvPath: string
  backendPath: string
}

const setupVenv = async ({
  userDataPath,
  emit
}: SetupVenvOptions): Promise<VenvInfo> => {
  const backendPath = path.join(userDataPath, BACKEND_DIRNAME)
  const venvPath = path.join(backendPath, '.venv')
  $.cwd = backendPath

  // Check if backend directory exists
  const backendExists = await pathExists(backendPath)
  if (!backendExists) {
    emit({
      level: BackendStatusLevel.Error,
      message: 'Backend directory not found. Clone the backend first.'
    })
    throw new Error('Backend directory not found')
  }

  emit({
    level: BackendStatusLevel.Info,
    message:
      'Backend directory verified. Virtual environment will be managed by uv sync.'
  })

  return { venvPath, backendPath }
}

export { setupVenv }
