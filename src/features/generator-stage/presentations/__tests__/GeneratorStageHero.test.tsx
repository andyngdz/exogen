import { useRecentRuns } from '@/features/generator-stage/states/useRecentRuns'
import { RecentRun } from '@/features/generator-stage/types'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorStageHero } from '../results/GeneratorStageHero'

vi.mock('@/features/generator-configs', () => ({
  useGeneratorAspectRatio: () => 1
}))

vi.mock('@/features/generator-stage/states/useRecentRuns', () => ({
  useRecentRuns: vi.fn()
}))

describe('GeneratorStageHero', () => {
  it('asks for an input image before the first run', () => {
    vi.mocked(useRecentRuns).mockReturnValue({ recentRuns: [] })

    render(<GeneratorStageHero />)

    expect(
      screen.getByText('Add an input image on the left, then generate.')
    ).toBeInTheDocument()
  })

  it('points to the recent runs once there are some', () => {
    vi.mocked(useRecentRuns).mockReturnValue({
      recentRuns: [{} as RecentRun]
    })

    render(<GeneratorStageHero />)

    expect(
      screen.getByText(
        'Generate to see your images here, or reuse a recent run below.'
      )
    ).toBeInTheDocument()
  })
})
