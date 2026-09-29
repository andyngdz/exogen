import { Card } from '@heroui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ImageInputHeader } from '../ImageInputHeader'

const renderHeader = (dropzoneLabel: string, isLoading: boolean) =>
  render(
    <Card>
      <ImageInputHeader dropzoneLabel={dropzoneLabel} isLoading={isLoading} />
    </Card>
  )

describe('ImageInputHeader', () => {
  it('renders the dropzone label in the card header', () => {
    const { container } = renderHeader('Drop here', false)

    expect(screen.getByText('Drop here')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="card-header"]')
    ).toContainElement(screen.getByText('Drop here'))
  })

  it('shows spinner when loading', () => {
    renderHeader('Drop here', true)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('hides spinner when not loading', () => {
    renderHeader('Drop here', false)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
