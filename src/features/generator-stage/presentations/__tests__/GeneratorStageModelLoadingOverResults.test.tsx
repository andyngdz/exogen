import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorStageModelLoadingOverResults } from '../panels/GeneratorStageModelLoadingOverResults'

vi.mock(
  '@/features/generator-stage/presentations/results/GeneratorStageResults',
  () => ({ GeneratorStageResults: () => <button>Last preview</button> })
)
vi.mock('../panels/GeneratorStageModelLoading', () => ({
  GeneratorStageModelLoading: () => <section>Loading progress</section>
}))

describe('GeneratorStageModelLoadingOverResults', () => {
  it('keeps the last preview under the load progress, out of reach', () => {
    render(<GeneratorStageModelLoadingOverResults />)

    expect(screen.getByText('Loading progress')).toBeInTheDocument()

    const lastPreview = screen.getByText('Last preview')
    expect(lastPreview.parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(lastPreview.parentElement).toHaveAttribute('inert')
    expect(
      screen.queryByRole('button', { name: 'Last preview' })
    ).not.toBeInTheDocument()
  })
})
