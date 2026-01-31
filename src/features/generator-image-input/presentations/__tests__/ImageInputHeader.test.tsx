import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ImageInputHeader } from '../ImageInputHeader'

vi.mock('@heroui/react', () => ({
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  Spinner: () => <div data-testid="spinner" />
}))

describe('ImageInputHeader', () => {
  it('renders the dropzone label', () => {
    render(<ImageInputHeader dropzoneLabel="Drop here" isLoading={false} />)

    expect(screen.getByText('Drop here')).toBeInTheDocument()
  })

  it('shows spinner when loading', () => {
    render(<ImageInputHeader dropzoneLabel="Drop here" isLoading={true} />)

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('hides spinner when not loading', () => {
    render(<ImageInputHeader dropzoneLabel="Drop here" isLoading={false} />)

    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  it('renders with correct structure', () => {
    render(<ImageInputHeader dropzoneLabel="Upload Image" isLoading={false} />)

    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
  })

  it('displays different labels correctly', () => {
    const { rerender } = render(
      <ImageInputHeader dropzoneLabel="Drag & Drop" isLoading={false} />
    )

    expect(screen.getByText('Drag & Drop')).toBeInTheDocument()

    rerender(
      <ImageInputHeader dropzoneLabel="Select a file" isLoading={false} />
    )

    expect(screen.getByText('Select a file')).toBeInTheDocument()
  })
})
