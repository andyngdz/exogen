import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SettingsMemoryConfig } from '../SettingsMemoryConfig'

const useSettingsMemoryMock = vi.hoisted(() => vi.fn())

vi.mock('../../states/useSettingsMemory', () => ({
  useSettingsMemory: useSettingsMemoryMock
}))

vi.mock('@/cores/presentations/memory-scale-factor', () => ({
  MemoryScaleFactorItems: ({
    gpuScaleFactor,
    ramScaleFactor,
    onGpuChange,
    onRamChange
  }: {
    gpuScaleFactor: number
    ramScaleFactor: number
    onGpuChange: (value: number) => void
    onRamChange: (value: number) => void
  }) => (
    <div data-testid="memory-items">
      <button data-testid="gpu-change" onClick={() => onGpuChange(0.7)}>
        gpu
      </button>
      <button data-testid="ram-change" onClick={() => onRamChange(0.4)}>
        ram
      </button>
      <div data-testid="gpu-value">{gpuScaleFactor}</div>
      <div data-testid="ram-value">{ramScaleFactor}</div>
    </div>
  ),
  MemoryScaleFactorPreview: ({
    gpuScaleFactor,
    ramScaleFactor
  }: {
    gpuScaleFactor: number
    ramScaleFactor: number
  }) => (
    <div data-testid="memory-preview">
      <div data-testid="gpu-preview">{gpuScaleFactor}</div>
      <div data-testid="ram-preview">{ramScaleFactor}</div>
    </div>
  )
}))

describe('SettingsMemoryConfig', () => {
  it('renders headings and memory controls', () => {
    useSettingsMemoryMock.mockReturnValue({
      gpu_scale_factor: 0.5,
      ram_scale_factor: 0.6,
      onGpuChange: vi.fn(),
      onRamChange: vi.fn()
    })

    render(<SettingsMemoryConfig />)

    expect(screen.getByText('Memory Configuration')).toBeInTheDocument()
    expect(
      screen.getByText('Adjust memory allocation for AI models')
    ).toBeInTheDocument()
    expect(screen.getByTestId('memory-items')).toBeInTheDocument()
    expect(screen.getByTestId('memory-preview')).toBeInTheDocument()
  })

  it('passes values and handlers to memory components', () => {
    const onGpuChange = vi.fn()
    const onRamChange = vi.fn()
    useSettingsMemoryMock.mockReturnValue({
      gpu_scale_factor: 0.25,
      ram_scale_factor: 0.35,
      onGpuChange,
      onRamChange
    })

    render(<SettingsMemoryConfig />)

    expect(screen.getByTestId('gpu-value')).toHaveTextContent('0.25')
    expect(screen.getByTestId('ram-value')).toHaveTextContent('0.35')

    screen.getByTestId('gpu-change').click()
    screen.getByTestId('ram-change').click()

    expect(onGpuChange).toHaveBeenCalledWith(0.7)
    expect(onRamChange).toHaveBeenCalledWith(0.4)
  })
})
