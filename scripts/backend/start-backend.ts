import { BackendStatusEmitter, BackendStatusLevel } from '@types'
import { cloneBackend } from './clone-backend'
import { ensurePython311 } from './ensure-python'
import { installDependencies } from './install-dependencies'
import { installUv } from './install-uv'
import { runBackend } from './run-backend'
import { setupVenv } from './setup-venv'
import { createDefaultStatusEmitter, normalizeError } from './utils'

export interface StartBackendOptions {
  userDataPath: string
  externalEmit?: BackendStatusEmitter
}

const startBackend = async ({
  userDataPath,
  externalEmit
}: StartBackendOptions) => {
  const emit = externalEmit ?? createDefaultStatusEmitter()

  try {
    // Step 1: Ensure Python 3.11 is installed
    await ensurePython311({ emit })

    // Step 2: Install uv (Python package manager)
    await installUv({ emit })

    // Step 3: Clone the backend repository
    const { backendPath } = await cloneBackend({ userDataPath, emit })

    // Step 4: Create virtual environment with uv and Python 3.11
    await setupVenv({ userDataPath, emit })

    // Step 5: Install dependencies using uv sync
    await installDependencies({ backendPath, emit })

    // Step 6: Run the ExoGen Backend with uv run uvicorn
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
