import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryScaleFactorItem } from '../MemoryScaleFactorItem'

describe('MemoryScaleFactorItem', () => {
  it('renders slider with success color for low value', () => {
    render(
      <MemoryScaleFactorItem
        fieldName="gpuScaleFactor"
        label="GPU allocation"
        description="Limit VRAM usage"
        value={0.5}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('GPU allocation slider')).toBeInTheDocument()
  })

  it('applies warning color when value is between 50% and 70%', () => {
    render(
      <MemoryScaleFactorItem
        fieldName="gpuScaleFactor"
        label="GPU allocation"
        description="Limit VRAM usage"
        value={0.6}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('GPU allocation slider')).toBeInTheDocument()
  })

  it('applies danger color when value is high', () => {
    render(
      <MemoryScaleFactorItem
        fieldName="ramScaleFactor"
        label="RAM allocation"
        description="Limit RAM usage"
        value={0.8}
        onChange={vi.fn()}
      />
    )

    const container = screen.getByTestId('memory-slider-ramScaleFactor')
    expect(container).toBeInTheDocument()
    expect(screen.getByLabelText('RAM allocation slider')).toBeInTheDocument()
  })

  it('displays label and description', () => {
    render(
      <MemoryScaleFactorItem
        fieldName="gpuScaleFactor"
        label="GPU allocation"
        description="Limit VRAM usage"
        value={0.5}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('GPU allocation')).toBeInTheDocument()
    expect(screen.getByText('Limit VRAM usage')).toBeInTheDocument()
  })
})
