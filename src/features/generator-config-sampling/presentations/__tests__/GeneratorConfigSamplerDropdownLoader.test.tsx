import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigSamplerDropdownLoader } from '../GeneratorConfigSamplerDropdownLoader'

vi.mock('@heroui/react', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className}>
      Loading skeleton
    </div>
  )
}))

describe('GeneratorConfigSamplerDropdownLoader', () => {
  it('renders skeleton with correct styling', () => {
    render(<GeneratorConfigSamplerDropdownLoader />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('h-10', 'w-full', 'rounded-medium')
  })
})
