import { BackendStatusEmitter, BackendStatusLevel } from '@types'
import * as path from 'node:path'
import { BACKEND_DIRNAME } from './constants'
import { installDependencies } from './install-dependencies'
import { installUv } from './install-uv'
import { runBackend } from './run-backend'
import { setupVenv } from './setup-venv'
import { syncBackend } from './sync-backend'
import { createDefaultStatusEmitter, normalizeError } from './utils'

export interface StartBackendOptions {
  userDataPath: string
  /** Backend source to sync from: the app's bundled copy, or <repo>/backend in development. */
  backendSourcePath: string
  /** App version; undefined syncs on every start, for the unpackaged dev app. */
  appVersion?: string
  externalEmit?: BackendStatusEmitter
}

const startBackend = async ({
  userDataPath,
  backendSourcePath,
  appVersion,
  externalEmit
}: StartBackendOptions) => {
  const emit = externalEmit ?? createDefaultStatusEmitter()

  try {
    // Step 1: Install uv; uv sync downloads the pinned Python when the system has none
    await installUv({ emit })

    // Step 2: Sync the bundled backend into the user data directory
    const { backendPath } = await syncBackend({
      sourcePath: backendSourcePath,
      backendPath: path.join(userDataPath, BACKEND_DIRNAME),
      version: appVersion,
      emit
    })

    // Step 3: Check the backend directory; uv sync creates the virtual environment
    await setupVenv({ userDataPath, emit })

    // Step 4: Install dependencies using uv sync
    await installDependencies({ backendPath, emit })

    // Step 5: Run the ExoGen Backend with uv run uvicorn
    await runBackend({ backendPath, emit })
  } catch (error) {
    const normalizedError = normalizeError(error, 'Unknown error')

    emit({
      level: BackendStatusLevel.Error,
      message: `Backend setup failed: ${normalizedError.message}`
    })
  }
}

export { startBackend }
