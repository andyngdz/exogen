import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ModelDetailsSibling } from '@/types'
import { ModelSearchViewFiles } from '../ModelSearchViewFiles'
import type { ModelSearchViewHeaderProps } from '../ModelSearchViewHeader'

// Mock header to assert title and href
vi.mock('../ModelSearchViewHeader', () => ({
  ModelSearchViewHeader: ({ title, href }: ModelSearchViewHeaderProps) => (
    <div data-testid="header">
      <div>title: {title}</div>
      <div>href: {href}</div>
    </div>
  )
}))

describe('ModelSearchViewFiles', () => {
  it('renders header, table headers, and formatted file rows', () => {
    const siblings: ModelDetailsSibling[] = [
      { blob_id: 'b1', rfilename: 'file1.bin', size: 0 },
      { blob_id: 'b2', rfilename: 'model.safetensors', size: 1024 },
      { blob_id: 'b3', rfilename: 'weights.bin', size: 1536 } // 1.5 KB
    ]

    render(<ModelSearchViewFiles id="author/model" siblings={siblings} />)

    // Header
    const header = screen.getByTestId('header')
    expect(within(header).getByText('title: Files')).toBeInTheDocument()
    expect(
      within(header).getByText(
        'href: https://huggingface.co/author/model/tree/main'
      )
    ).toBeInTheDocument()

    // Table and headers
    expect(
      screen.getByRole('grid', { name: 'Files table' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Name' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Size' })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)

    // Rows contents with formatted sizes
    expect(screen.getByText('file1.bin')).toBeInTheDocument()
    expect(screen.getByText('0 B')).toBeInTheDocument()

    expect(screen.getByText('model.safetensors')).toBeInTheDocument()
    expect(screen.getByText('1 KB')).toBeInTheDocument()

    expect(screen.getByText('weights.bin')).toBeInTheDocument()
    expect(screen.getByText('1.5 KB')).toBeInTheDocument()
  })

  it('renders no rows when siblings is empty', () => {
    render(<ModelSearchViewFiles id="author/model" siblings={[]} />)

    // Header still present
    expect(screen.getByTestId('header')).toBeInTheDocument()

    // Only the header row remains
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})
