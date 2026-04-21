import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cloneRepository, isGitAvailable, updateRepository } from '../git'

type CommandRecorder = (
  pieces: TemplateStringsArray,
  ...args: unknown[]
) => Promise<void>

const { mock$, mockDollar } = vi.hoisted(() => {
  const innerMock$ = vi.fn<CommandRecorder>()

  const innerDollar: CommandRecorder & { cwd: string } = Object.assign(
    (pieces: TemplateStringsArray, ...args: unknown[]) =>
      innerMock$(pieces, ...args),
    { cwd: '' }
  )

  return { mock$: innerMock$, mockDollar: innerDollar }
})

vi.mock('zx', () => ({
  $: mockDollar,
  usePowerShell: vi.fn()
}))

describe('git helpers', () => {
  let recordedCommands: string[]
  let cwdSnapshots: string[]
  const originalCwd = process.cwd()

  beforeEach(() => {
    recordedCommands = []
    cwdSnapshots = []
    mockDollar.cwd = originalCwd

    mock$.mockImplementation(
      (pieces: TemplateStringsArray, ...args: unknown[]) => {
        const command = pieces.reduce((acc, part, index) => {
          const interpolation = index < args.length ? String(args[index]) : ''
          return acc + part + interpolation
        }, '')

        recordedCommands.push(command.trim())
        cwdSnapshots.push(mockDollar.cwd)

        return Promise.resolve()
      }
    )
  })

  afterEach(() => {
    mock$.mockReset()
    mockDollar.cwd = originalCwd
  })

  describe('isGitAvailable', () => {
    it('returns true when git command succeeds', async () => {
      const result = await isGitAvailable()

      expect(result).toBe(true)
      expect(recordedCommands).toStrictEqual(['git --version'])
    })

    it('returns false when git command fails', async () => {
      mock$.mockImplementationOnce(
        (pieces: TemplateStringsArray, ...args: unknown[]) => {
          const command = pieces.reduce((acc, part, index) => {
            const interpolation = index < args.length ? String(args[index]) : ''
            return acc + part + interpolation
          }, '')
          recordedCommands.push(command.trim())
          cwdSnapshots.push(mockDollar.cwd)
          return Promise.reject(new Error('git missing'))
        }
      )

      const result = await isGitAvailable()

      expect(result).toBe(false)
      expect(recordedCommands).toStrictEqual(['git --version'])
    })
  })

  describe('cloneRepository', () => {
    it('invokes git clone with branch and destination', async () => {
      await cloneRepository(
        'https://example.com/repo.git',
        '/tmp/repo',
        'release'
      )

      expect(recordedCommands).toStrictEqual([
        'git clone --branch release --single-branch https://example.com/repo.git /tmp/repo'
      ])
    })
  })

  describe('updateRepository', () => {
    it('fetches, checks out, and resets the target branch inside repo path', async () => {
      await updateRepository('/tmp/repo', 'release')

      expect(recordedCommands).toStrictEqual([
        'git fetch origin release',
        'git checkout release',
        'git reset --hard origin/release'
      ])
      expect(cwdSnapshots).toStrictEqual([
        '/tmp/repo',
        '/tmp/repo',
        '/tmp/repo'
      ])
      expect(mockDollar.cwd).toBe(originalCwd)
    })

    it('resets cwd and rethrows with context when a command fails', async () => {
      mock$.mockImplementationOnce(
        (pieces: TemplateStringsArray, ...args: unknown[]) => {
          const command = pieces.reduce((acc, part, index) => {
            const interpolation = index < args.length ? String(args[index]) : ''
            return acc + part + interpolation
          }, '')
          recordedCommands.push(command.trim())
          cwdSnapshots.push(mockDollar.cwd)
          return Promise.reject(new Error('fetch failed'))
        }
      )

      await expect(updateRepository('/tmp/repo', 'stable')).rejects.toThrow(
        'Failed to update repository: Error: fetch failed'
      )

      expect(recordedCommands).toStrictEqual(['git fetch origin stable'])
      expect(mockDollar.cwd).toBe(originalCwd)
    })
  })
})
