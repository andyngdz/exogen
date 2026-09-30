import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Editor } from '../Editor'

vi.mock('@/features/generators', () => ({
  Generator: () => <div data-testid="mock-generator">Generator</div>
}))

describe('Editor', () => {
  it('renders the generator', () => {
    render(<Editor />)

    expect(screen.getByTestId('mock-generator')).toBeInTheDocument()
  })
})
