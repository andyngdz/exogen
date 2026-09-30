import { BackendStatusLevel } from '@types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureGit, GIT_INSTALL_MESSAGE } from '../ensure-git'

const { mock$ } = vi.hoisted(() => ({ mock$: vi.fn() }))

vi.mock('@scripts/zx-config', () => ({
  $: (pieces: TemplateStringsArray, ...args: unknown[]) => mock$(pieces, ...args)
}))

describe('ensureGit', () => {
  const emit = vi.fn()

  beforeEach(() => {
    emit.mockClear()
    mock$.mockReset()
  })

  it('passes when git is installed', async () => {
    mock$.mockResolvedValue(undefined)

    await ensureGit({ emit })

    expect(mock$.mock.calls[0][0].join('')).toBe('git --version')
    expect(emit).not.toHaveBeenCalledWith(
      expect.objectContaining({ level: BackendStatusLevel.Error })
    )
  })

  it('stops setup with an install hint when git is missing', async () => {
    mock$.mockRejectedValue(new Error('command not found: git'))

    await expect(ensureGit({ emit })).rejects.toThrow('Git is not installed')

    expect(emit).toHaveBeenCalledWith({
      level: BackendStatusLevel.Error,
      message: GIT_INSTALL_MESSAGE
    })
  })
})
