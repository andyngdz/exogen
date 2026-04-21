import { render, screen, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
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

// Mock @heroui/react table primitives to simple containers
vi.mock('@heroui/react', () => ({
  Table: ({
    children,
    removeWrapper: _removeWrapper,
    ...rest
  }: PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="table" {...rest}>
      {children}
    </div>
  ),
  TableHeader: ({ children }: PropsWithChildren) => (
    <div data-testid="table-header">{children}</div>
  ),
  TableBody: ({ children }: PropsWithChildren) => (
    <div data-testid="table-body">{children}</div>
  ),
  TableColumn: ({ children }: PropsWithChildren) => (
    <div role="columnheader">{children}</div>
  ),
  TableRow: ({ children }: PropsWithChildren) => (
    <div role="row">{children}</div>
  ),
  TableCell: ({ children }: PropsWithChildren) => (
    <div role="cell">{children}</div>
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
    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()

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

    // Table body exists but has no rows
    const body = screen.getByTestId('table-body')
    expect(within(body).queryByRole('row')).not.toBeInTheDocument()
  })
})
