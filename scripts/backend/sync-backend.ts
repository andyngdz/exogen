import { BackendStatusEmitter, BackendStatusLevel } from '@types'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { BACKEND_DIRNAME } from './constants'
import { normalizeError, pathExists } from './utils'

const VERSION_FILENAME = '.exogen-backend-version'
const STATIC_DIRNAME = 'static'
const GENERATED_IMAGES_DIRNAME = 'generated_images'

const DATABASE_FILENAME = 'exogen_backend.db'
const MAIN_FILENAME = 'main.py'

// User data the backend writes next to its code (paths are relative to its
// working directory), so a sync must never delete these entries. `.git` stays
// so an older app that still pulls the backend with Git can restore its code.
const PROTECTED_ENTRIES = new Set(['.venv', '.cache', '.git'])

// Development syncs copy from <repo>/backend, which holds the developer's own
// environment, caches and data; none of it belongs in the app's copy.
const EXCLUDED_NAMES = new Set([
  '.venv',
  '.cache',
  '.git',
  '.pytest_cache',
  '.ruff_cache',
  '__pycache__',
  'tests',
  'docs',
  'openspec',
  '.vscode',
  '.opencode',
  '.coverage',
  'coverage.xml'
])

export interface SyncBackendOptions {
  sourcePath: string
  backendPath: string
  /** App version to sync to; undefined always syncs, for the unpackaged dev app. */
  version?: string
  emit: BackendStatusEmitter
}

const isLogFile = (name: string) => name.endsWith('.log') || name === 'logs.txt'

// Covers SQLite sidecars (-journal, -wal, -shm), which hold uncommitted rows.
const isDatabaseFile = (name: string) =>
  name.startsWith(DATABASE_FILENAME) || name.endsWith('.db')

const isProtectedEntry = (name: string) =>
  PROTECTED_ENTRIES.has(name) || isLogFile(name) || isDatabaseFile(name)

/** Returns true when a source path should not be copied into the app's backend. */
const isExcludedFromCopy = (sourcePath: string, entryPath: string) => {
  const relativePath = path.relative(sourcePath, entryPath)
  if (!relativePath) return false

  const segments = relativePath.split(path.sep)
  const name = path.basename(entryPath)

  if (segments.some((segment) => EXCLUDED_NAMES.has(segment))) return true
  // Never copy anything the sync protects, or a dev sync would overwrite user data.
  if (segments.length === 1 && isProtectedEntry(name)) return true
  if (isDatabaseFile(name) || name.endsWith('.egg-info')) return true
  if (name === VERSION_FILENAME) return true

  return (
    segments[0] === STATIC_DIRNAME && segments[1] === GENERATED_IMAGES_DIRNAME
  )
}

const readSyncedVersion = async (backendPath: string) => {
  const versionPath = path.join(backendPath, VERSION_FILENAME)
  if (!(await pathExists(versionPath))) return

  const content = await fs.readFile(versionPath, 'utf8')
  return content.trim()
}

/** Returns true when the directory holds this version's code, so the sync can be skipped. */
const isSyncedTo = async (backendPath: string, version: string) => {
  if (!(await pathExists(path.join(backendPath, MAIN_FILENAME)))) return false
  return (await readSyncedVersion(backendPath)) === version
}

/** Lists every code path in the backend directory, leaving user data out. */
const listCodePaths = async (backendPath: string) => {
  const entries = await fs.readdir(backendPath, { withFileTypes: true })
  const codeEntries = entries.filter((entry) => !isProtectedEntry(entry.name))

  const pathGroups = await Promise.all(
    codeEntries.map(async (entry) => {
      const entryPath = path.join(backendPath, entry.name)
      if (entry.name !== STATIC_DIRNAME || !entry.isDirectory()) {
        return [entryPath]
      }

      const staticEntries = await fs.readdir(entryPath)
      return staticEntries
        .filter((staticEntry) => staticEntry !== GENERATED_IMAGES_DIRNAME)
        .map((staticEntry) => path.join(entryPath, staticEntry))
    })
  )

  return pathGroups.flat()
}

/** Deletes every code entry in the backend directory, keeping user data. */
const removeCodeEntries = async (backendPath: string) => {
  const codePaths = await listCodePaths(backendPath)
  await Promise.all(
    codePaths.map((codePath) =>
      fs.rm(codePath, { recursive: true, force: true })
    )
  )
}

/**
 * Copies the bundled backend into the app's backend directory when the app
 * version changed, keeping models, the virtual environment, the database and
 * generated images in place.
 */
const syncBackend = async ({
  sourcePath,
  backendPath,
  version,
  emit
}: SyncBackendOptions) => {
  // The delete step runs inside backendPath, so refuse any other directory.
  if (path.basename(backendPath) !== BACKEND_DIRNAME) {
    throw new Error(`Refusing to sync into ${backendPath}`)
  }

  if (!(await pathExists(sourcePath))) {
    emit({
      level: BackendStatusLevel.Error,
      message: 'Bundled backend not found. Reinstall ExoGen.'
    })
    throw new Error(`Bundled backend not found at ${sourcePath}`)
  }

  if (version && (await isSyncedTo(backendPath, version))) {
    emit({ level: BackendStatusLevel.Info, message: 'Backend is up to date.' })
    return { backendPath }
  }

  emit({ level: BackendStatusLevel.Info, message: 'Updating backend files…' })

  try {
    await fs.mkdir(backendPath, { recursive: true })
    await removeCodeEntries(backendPath)
    await fs.cp(sourcePath, backendPath, {
      recursive: true,
      force: true,
      filter: (entryPath) => !isExcludedFromCopy(sourcePath, entryPath)
    })

    // Written last, so a sync interrupted before this point repeats on the next
    // start. The dev app writes none, so a packaged app sharing this userData
    // never mistakes dev code for its own version.
    if (version) {
      await fs.writeFile(path.join(backendPath, VERSION_FILENAME), version)
    }
  } catch (error) {
    const normalizedError = normalizeError(error, 'Failed to update backend')

    emit({
      level: BackendStatusLevel.Error,
      message: `Failed to update backend files in ${backendPath}: ${normalizedError.message}`
    })
    throw normalizedError
  }

  emit({ level: BackendStatusLevel.Info, message: 'Backend files updated.' })

  return { backendPath }
}

export { syncBackend, VERSION_FILENAME }
