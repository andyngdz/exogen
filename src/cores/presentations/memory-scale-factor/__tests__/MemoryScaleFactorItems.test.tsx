import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryScaleFactorItems } from '../MemoryScaleFactorItems'

// Mock the MemoryScaleFactorItem component
vi.mock('../MemoryScaleFactorItem', () => ({
  MemoryScaleFactorItem: ({ fieldName }: { fieldName: string }) => (
    <div data-testid={`memory-slider-${fieldName}`}>Slider {fieldName}</div>
  )
}))

describe('MemoryScaleFactorItems', () => {
  it('renders GPU and RAM sliders', () => {
    render(
      <MemoryScaleFactorItems
        gpuScaleFactor={0.5}
        ramScaleFactor={0.5}
        onGpuChange={vi.fn()}
        onRamChange={vi.fn()}
      />
    )

    expect(
      screen.getByTestId('memory-slider-gpuScaleFactor')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('memory-slider-ramScaleFactor')
    ).toBeInTheDocument()
  })

  it('wraps sliders in layout container', () => {
    render(
      <MemoryScaleFactorItems
        gpuScaleFactor={0.5}
        ramScaleFactor={0.5}
        onGpuChange={vi.fn()}
        onRamChange={vi.fn()}
      />
    )

    const container = screen.getByTestId('memory-scale-factor-sliders')
    expect(container).toBeInTheDocument()
  })
})
