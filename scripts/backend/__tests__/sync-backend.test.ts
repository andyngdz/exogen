import { BackendStatusLevel } from '@types'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { syncBackend, VERSION_FILENAME } from '../sync-backend'

const cpOverride = vi.hoisted(() => ({ error: undefined as Error | undefined }))

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()

  return {
    ...actual,
    cp: vi.fn(async (...args: Parameters<typeof actual.cp>) => {
      if (cpOverride.error) throw cpOverride.error
      return actual.cp(...args)
    })
  }
})

const writeFile = async (filePath: string, content: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content)
}

const readFile = (filePath: string) => fs.readFile(filePath, 'utf8')

const exists = async (filePath: string) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

describe('syncBackend', () => {
  let rootPath: string
  let sourcePath: string
  let backendPath: string
  const emit = vi.fn()

  beforeEach(async () => {
    cpOverride.error = undefined
    emit.mockClear()
    rootPath = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-backend-'))
    sourcePath = path.join(rootPath, 'resources', 'backend')
    backendPath = path.join(rootPath, 'userData', 'exogen_backend')

    await writeFile(path.join(sourcePath, 'main.py'), 'new main')
    await writeFile(path.join(sourcePath, 'app', 'api.py'), 'new api')
    await writeFile(path.join(sourcePath, 'static', 'styles', 'a.jpg'), 'style')
  })

  afterEach(async () => {
    await fs.rm(rootPath, { recursive: true, force: true })
  })

  it('copies the bundle and writes the version marker on first start', async () => {
    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })

    expect(await readFile(path.join(backendPath, 'main.py'))).toBe('new main')
    expect(await readFile(path.join(backendPath, 'app', 'api.py'))).toBe(
      'new api'
    )
    expect(await readFile(path.join(backendPath, VERSION_FILENAME))).toBe(
      '1.2.3'
    )
  })

  it('keeps user data and the git clone, and removes old code, when upgrading', async () => {
    const protectedFiles = {
      '.venv/lib/site.py': 'venv',
      '.cache/models--sdxl/weights.bin': 'model',
      'exogen_backend.db': 'history',
      'exogen_backend.db-journal': 'pending rows',
      '.git/HEAD': 'ref: refs/heads/release',
      'static/generated_images/run.png': 'image',
      'backend.log': 'log',
      'logs.txt': 'log text'
    }
    for (const [relativePath, content] of Object.entries(protectedFiles)) {
      await writeFile(path.join(backendPath, relativePath), content)
    }
    await writeFile(path.join(backendPath, 'main.py'), 'old main')
    await writeFile(path.join(backendPath, 'app', 'removed.py'), 'stale')
    await writeFile(path.join(backendPath, 'static', 'styles', 'old.jpg'), 'x')

    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })

    for (const [relativePath, content] of Object.entries(protectedFiles)) {
      expect(await readFile(path.join(backendPath, relativePath))).toBe(content)
    }
    expect(await exists(path.join(backendPath, 'app', 'removed.py'))).toBe(
      false
    )
    expect(
      await exists(path.join(backendPath, 'static', 'styles', 'old.jpg'))
    ).toBe(false)
    expect(await readFile(path.join(backendPath, 'main.py'))).toBe('new main')
  })

  it('skips the sync when the marker matches the app version', async () => {
    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })
    await writeFile(path.join(backendPath, 'local-edit.py'), 'kept')

    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })

    expect(await readFile(path.join(backendPath, 'local-edit.py'))).toBe('kept')
    expect(emit).toHaveBeenLastCalledWith({
      level: BackendStatusLevel.Info,
      message: 'Backend is up to date.'
    })
  })

  it('restores bundled code after an older app reset it but left the marker', async () => {
    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })
    // An older, cloning app runs `git reset --hard`, which rewrites tracked
    // code but leaves the untracked version marker in place.
    await writeFile(path.join(backendPath, 'main.py'), 'release main')
    await writeFile(path.join(backendPath, 'app', 'api.py'), 'release api')

    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })

    expect(await readFile(path.join(backendPath, 'main.py'))).toBe('new main')
    expect(await readFile(path.join(backendPath, 'app', 'api.py'))).toBe(
      'new api'
    )
  })

  it('syncs again when the marker matches but the code is missing', async () => {
    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })
    await fs.rm(path.join(backendPath, 'main.py'))

    await syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })

    expect(await readFile(path.join(backendPath, 'main.py'))).toBe('new main')
  })

  it('does not overwrite user logs from a development source', async () => {
    await writeFile(path.join(backendPath, 'logs.txt'), 'user log')
    await writeFile(path.join(sourcePath, 'logs.txt'), 'developer log')

    await syncBackend({ sourcePath, backendPath, emit })

    expect(await readFile(path.join(backendPath, 'logs.txt'))).toBe('user log')
  })

  it('does not write the marker when the copy fails, so the next start retries', async () => {
    cpOverride.error = new Error('disk full')

    await expect(
      syncBackend({ sourcePath, backendPath, version: '1.2.3', emit })
    ).rejects.toThrow('disk full')

    expect(await exists(path.join(backendPath, VERSION_FILENAME))).toBe(false)
    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: `Failed to update backend files in ${backendPath}: disk full`
    })
  })

  it('always syncs in development and skips the developer environment and data', async () => {
    const devOnlyFiles = [
      '.venv/lib/site.py',
      '.cache/models--sdxl/weights.bin',
      'tests/test_api.py',
      'app/__pycache__/api.cpython-311.pyc',
      'exogen_backend.db',
      'static/generated_images/run.png',
      'exogen_backend.egg-info/PKG-INFO',
      'exogen_backend.db-journal',
      'logs.txt',
      'uvicorn.log'
    ]
    for (const relativePath of devOnlyFiles) {
      await writeFile(path.join(sourcePath, relativePath), 'dev')
    }

    await syncBackend({ sourcePath, backendPath, emit })
    await writeFile(path.join(sourcePath, 'main.py'), 'edited main')
    await syncBackend({ sourcePath, backendPath, emit })

    expect(await readFile(path.join(backendPath, 'main.py'))).toBe(
      'edited main'
    )
    expect(await exists(path.join(backendPath, VERSION_FILENAME))).toBe(false)
    for (const relativePath of devOnlyFiles) {
      expect(await exists(path.join(backendPath, relativePath))).toBe(false)
    }
  })

  it('reports a missing bundle', async () => {
    await expect(
      syncBackend({
        sourcePath: path.join(rootPath, 'missing'),
        backendPath,
        version: '1.2.3',
        emit
      })
    ).rejects.toThrow('Bundled backend not found')

    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: 'Bundled backend not found. Reinstall ExoGen.'
    })
  })

  it('refuses to sync into a directory other than exogen_backend', async () => {
    const userDataPath = path.join(rootPath, 'userData')
    await writeFile(path.join(userDataPath, 'settings.json'), 'keep')

    await expect(
      syncBackend({
        sourcePath,
        backendPath: userDataPath,
        version: '1.2.3',
        emit
      })
    ).rejects.toThrow('Refusing to sync')

    expect(await readFile(path.join(userDataPath, 'settings.json'))).toBe(
      'keep'
    )
  })
})
