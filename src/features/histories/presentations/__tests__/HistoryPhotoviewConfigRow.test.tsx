import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HistoryPhotoviewConfigRow } from '../HistoryPhotoviewConfigRow'

describe('HistoryPhotoviewConfigRow', () => {
  it('should render label and string value', () => {
    render(
      <HistoryPhotoviewConfigRow label="Prompt" value="A beautiful sunset" />
    )

    expect(screen.getByText('Prompt')).toBeInTheDocument()
    expect(screen.getByText('A beautiful sunset')).toBeInTheDocument()
  })

  it('should render label and number value', () => {
    render(<HistoryPhotoviewConfigRow label="Steps" value={20} />)

    expect(screen.getByText('Steps')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should render "None" for empty array', () => {
    render(<HistoryPhotoviewConfigRow label="Styles" value={[]} />)

    expect(screen.getByText('Styles')).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('should render array values as chips', () => {
    render(
      <HistoryPhotoviewConfigRow
        label="Styles"
        value={['anime', 'fantasy', 'digital-art']}
      />
    )

    expect(screen.getByText('Styles')).toBeInTheDocument()
    expect(screen.getByText('anime')).toBeInTheDocument()
    expect(screen.getByText('fantasy')).toBeInTheDocument()
    expect(screen.getByText('digital-art')).toBeInTheDocument()
  })

  it('should render single item array as chip', () => {
    render(<HistoryPhotoviewConfigRow label="Styles" value={['watercolor']} />)

    expect(screen.getByText('Styles')).toBeInTheDocument()
    expect(screen.getByText('watercolor')).toBeInTheDocument()
  })

  it('should have bottom border styling', () => {
    const { container } = render(
      <HistoryPhotoviewConfigRow label="Model" value="stable-diffusion" />
    )

    const row = container.firstChild as HTMLElement
    expect(row).toHaveClass('border-b')
    expect(row).toHaveClass('border-default')
  })

  it('should have justify-between layout', () => {
    const { container } = render(
      <HistoryPhotoviewConfigRow label="Width" value={512} />
    )

    const row = container.firstChild as HTMLElement
    expect(row).toHaveClass('justify-between')
  })

  it('should render label without colon', () => {
    render(<HistoryPhotoviewConfigRow label="CFG Scale" value={7.5} />)

    const label = screen.getByText('CFG Scale')
    expect(label.textContent).toBe('CFG Scale')
    expect(label.textContent).not.toContain(':')
  })

  it('should handle long array values', () => {
    const longArray = [
      'style1',
      'style2',
      'style3',
      'style4',
      'style5',
      'style6',
      'style7',
      'style8'
    ]

    render(<HistoryPhotoviewConfigRow label="Styles" value={longArray} />)

    longArray.forEach((style) => {
      expect(screen.getByText(style)).toBeInTheDocument()
    })
  })

  it('should render zero as valid number value', () => {
    render(<HistoryPhotoviewConfigRow label="Seed" value={0} />)

    expect(screen.getByText('Seed')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should render negative numbers correctly', () => {
    render(<HistoryPhotoviewConfigRow label="Seed" value={-1} />)

    expect(screen.getByText('Seed')).toBeInTheDocument()
    expect(screen.getByText('-1')).toBeInTheDocument()
  })
})
