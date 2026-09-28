import { existsSync, mkdtempSync } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { installUv } from '@scripts/backend/install-uv'
import { createDefaultStatusEmitter, isWindows } from '@scripts/backend/utils'
import { $ } from '@scripts/zx-config'

const XDG_KEYS = [
  'XDG_BIN_HOME',
  'XDG_CACHE_HOME',
  'XDG_CONFIG_HOME',
  'XDG_DATA_HOME',
  'UV_INSTALL_DIR'
]

/**
 * PATH with only the system tools the installer needs, so a uv already on the
 * machine cannot satisfy the first detection.
 */
const systemPath = () => {
  if (!isWindows) {
    return '/usr/bin:/bin'
  }

  const systemRoot = process.env.SystemRoot ?? 'C:\\Windows'

  return [
    path.join(systemRoot, 'System32'),
    systemRoot,
    path.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0')
  ].join(';')
}

/**
 * Points HOME and USERPROFILE at a fresh temp directory and strips PATH, so
 * installUv starts from a machine without uv. Returns the temp home.
 */
const isolateHome = () => {
  const home = mkdtempSync(path.join(os.tmpdir(), 'exogen-uv-smoke-'))

  process.env.HOME = home
  process.env.USERPROFILE = home
  process.env.PATH = systemPath()

  for (const key of XDG_KEYS) {
    delete process.env[key]
  }

  return home
}

/**
 * Runs the real uv installer the app uses at startup and fails unless uv lands
 * in the isolated home and resolves from PATH afterwards.
 */
const smokeInstallUv = async () => {
  const home = isolateHome()
  const uvBinary = path.join(home, '.local', 'bin', isWindows ? 'uv.exe' : 'uv')

  const { version } = await installUv({ emit: createDefaultStatusEmitter() })

  if (!existsSync(uvBinary)) {
    throw new Error(`uv ${version} was detected, but not at ${uvBinary}`)
  }

  const result = await $`uv --version`

  console.log(`uv smoke test passed: ${result.stdout.trim()} at ${uvBinary}`)
}

export { isolateHome, smokeInstallUv, systemPath }
