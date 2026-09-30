import { useUseConfig } from '@/features/histories/states'
import { HistoryItem } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorStageRecentRun } from '../results/GeneratorStageRecentRun'

vi.mock('@/features/histories/states', () => ({
  useUseConfig: vi.fn()
}))

const history = {
  id: 3,
  prompt: 'a lighthouse in heavy rain'
} as HistoryItem

describe('GeneratorStageRecentRun', () => {
  it('applies the run config from its card', async () => {
    const user = userEvent.setup()
    const onUseConfig = vi.fn()
    vi.mocked(useUseConfig).mockReturnValue({ onUseConfig })

    render(
      <GeneratorStageRecentRun
        recentRun={{
          history,
          metaLabel: '13:48 · 4 images · seed 1193044871',
          prompt: history.prompt
        }}
      />
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Recent run: a lighthouse in heavy rain'
      })
    )
    await user.click(screen.getByRole('button', { name: 'Use this config' }))

    expect(onUseConfig).toHaveBeenCalledTimes(1)
  })
})
