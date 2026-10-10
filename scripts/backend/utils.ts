import { BackendStatusLevel, BackendStatusPayload } from '@types'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { createServer } from 'node:net'

const isWindows = process.platform === 'win32'
const isLinux = process.platform === 'linux'

const pathKeyName = () => {
  if (!isWindows) {
    return 'PATH'
  }

  const entries = Object.keys(process.env)
  const match = entries.find((key) => key.toLowerCase() === 'path')

  return match ?? 'PATH'
}

const ensurePathIncludes = (directories: string[]) => {
  if (!directories.length) {
    return
  }

  const separator = process.platform === 'win32' ? ';' : ':'
  const key = pathKeyName()
  const currentValue = process.env[key]
  const current = currentValue
    ? currentValue.split(separator).filter(Boolean)
    : []

  const additions = directories
    .filter(Boolean)
    .filter((directory) => existsSync(directory))
    .filter((directory) => !current.includes(directory))

  if (!additions.length) {
    return
  }

  const updated = [...additions, ...current]
  process.env[key] = updated.join(separator)
}

/**
 * Checks if a file or directory exists at the given path
 * @param targetPath - The path to check
 * @returns Promise<boolean> - true if path exists, false otherwise
 */
const pathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await fs.access(targetPath)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }

    throw error
  }
}

/**
 * Normalizes an error to ensure it's an Error instance
 * @param error - The error to normalize
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Error instance
 */
const normalizeError = (error: unknown, defaultMessage: string): Error => {
  return error instanceof Error ? error : new Error(defaultMessage)
}

/**
 * Creates a default status emitter that logs to console
 * @returns BackendStatusEmitter function
 */
const createDefaultStatusEmitter = () => (payload: BackendStatusPayload) => {
  const prefix =
    payload.level === BackendStatusLevel.Error
      ? '[Backend Setup][Error]'
      : '[Backend Setup][Info]'

  console.log(`${prefix} ${payload.message}`)
}

/**
 * Checks if a port is available
 * @param port - The port number to check
 * @returns Promise<boolean> - true if port is available, false if occupied
 */
const isPortAvailable = (port: number) => {
  return new Promise<boolean>((resolve) => {
    const server = createServer()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close()
      resolve(true)
    })

    server.listen(port, '127.0.0.1')
  })
}

/**
 * Finds an available port, starting from the preferred port
 * @param preferredPort - The port to try first (default: 8000)
 * @param maxAttempts - Maximum number of ports to try (default: 100)
 * @returns Promise<number> - The first available port found
 * @throws Error if no available port is found within maxAttempts
 */
const findAvailablePort = async (preferredPort = 8000, maxAttempts = 100) => {
  for (let i = 0; i < maxAttempts; i++) {
    const port = preferredPort + i
    const available = await isPortAvailable(port)

    if (available) {
      return port
    }
  }

  throw new Error(
    `Could not find an available port after trying ${maxAttempts} ports starting from ${preferredPort}`
  )
}

export {
  createDefaultStatusEmitter,
  ensurePathIncludes,
  findAvailablePort,
  isLinux,
  isPortAvailable,
  isWindows,
  normalizeError,
  pathExists
}
