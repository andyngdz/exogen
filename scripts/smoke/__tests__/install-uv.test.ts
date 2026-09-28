import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mock$, mockInstallUv } = vi.hoisted(() => ({
  mock$: vi.fn(),
  mockInstallUv: vi.fn()
}))

let mockIsWindows = false

vi.mock('@scripts/zx-config', () => ({
  $: (...args: unknown[]) => mock$(...args)
}))

vi.mock('@scripts/backend/install-uv', () => ({
  installUv: mockInstallUv
}))

vi.mock('@scripts/backend/utils', () => ({
  get isWindows() {
    return mockIsWindows
  },
  createDefaultStatusEmitter: () => vi.fn()
}))

import { isolateHome, smokeInstallUv, systemPath } from '../install-uv'

const tempHomes: string[] = []

// Stands in for the real installer: drops a `uv` file into the isolated home.
const fakeInstallerWritingUv = async () => {
  const home = os.homedir()
  const binDir = path.join(home, '.local', 'bin')

  tempHomes.push(home)
  mkdirSync(binDir, { recursive: true })
  writeFileSync(path.join(binDir, 'uv'), '')

  return { version: '0.12.19' }
}

describe('uv smoke test', () => {
  beforeEach(() => {
    mock$.mockReset()
    mockInstallUv.mockReset()
    mockIsWindows = false

    // Stub every key isolateHome touches so unstubAllEnvs restores them.
    vi.stubEnv('HOME', '/home/tester')
    vi.stubEnv('USERPROFILE', '/home/tester')
    vi.stubEnv('PATH', '/home/tester/.local/bin:/usr/bin')
    vi.stubEnv('XDG_BIN_HOME', '/home/tester/bin')
    vi.stubEnv('XDG_CACHE_HOME', '/home/tester/.cache')
    vi.stubEnv('XDG_CONFIG_HOME', '/home/tester/.config')
    vi.stubEnv('XDG_DATA_HOME', '/home/tester/.local/share')
    vi.stubEnv('UV_INSTALL_DIR', '/opt/uv')
  })

  afterEach(() => {
    vi.unstubAllEnvs()

    for (const home of tempHomes.splice(0)) {
      rmSync(home, { recursive: true, force: true })
    }
  })

  describe('systemPath', () => {
    it('keeps only the POSIX system directories', () => {
      expect(systemPath()).toBe('/usr/bin:/bin')
    })

    it('keeps System32, SystemRoot and Windows PowerShell on Windows', () => {
      mockIsWindows = true
      vi.stubEnv('SystemRoot', 'D:\\Win')

      expect(systemPath()).toBe(
        [
          path.join('D:\\Win', 'System32'),
          'D:\\Win',
          path.join('D:\\Win', 'System32', 'WindowsPowerShell', 'v1.0')
        ].join(';')
      )
    })
  })

  describe('isolateHome', () => {
    it('points home at a fresh temp dir and drops user tool paths', () => {
      const home = isolateHome()
      tempHomes.push(home)

      expect(home.startsWith(path.join(os.tmpdir(), 'exogen-uv-smoke-'))).toBe(
        true
      )
      expect(existsSync(home)).toBe(true)
      expect(process.env.HOME).toBe(home)
      expect(process.env.USERPROFILE).toBe(home)
      expect(process.env.PATH).toBe('/usr/bin:/bin')
      expect(process.env.XDG_BIN_HOME).toBeUndefined()
      expect(process.env.XDG_CONFIG_HOME).toBeUndefined()
      expect(process.env.UV_INSTALL_DIR).toBeUndefined()
    })
  })

  describe('smokeInstallUv', () => {
    it('passes when uv lands in the isolated home and runs', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

      mockInstallUv.mockImplementation(fakeInstallerWritingUv)
      mock$.mockResolvedValue({ stdout: 'uv 0.12.19\n' })

      await smokeInstallUv()

      const uvBinary = path.join(tempHomes[0], '.local', 'bin', 'uv')
      expect(log).toHaveBeenCalledWith(
        `uv smoke test passed: uv 0.12.19 at ${uvBinary}`
      )
      log.mockRestore()
    })

    it('fails when uv was detected somewhere other than the isolated home', async () => {
      mockInstallUv.mockImplementation(async () => {
        tempHomes.push(os.homedir())
        return { version: '0.12.19' }
      })

      await expect(smokeInstallUv()).rejects.toThrow(
        /uv 0\.12\.19 was detected, but not at .*uv$/
      )
      expect(mock$).not.toHaveBeenCalled()
    })

    it('expects uv.exe on Windows', async () => {
      mockIsWindows = true
      mockInstallUv.mockImplementation(fakeInstallerWritingUv)

      await expect(smokeInstallUv()).rejects.toThrow(/uv\.exe$/)
    })
  })
})
