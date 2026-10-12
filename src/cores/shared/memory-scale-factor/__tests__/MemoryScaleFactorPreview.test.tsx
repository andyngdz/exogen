import { useConfig } from '@/cores/hooks'
import { formatter } from '@/services'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryScaleFactorPreview } from '../MemoryScaleFactorPreview'

vi.mock('@/cores/hooks', () => ({
  useConfig: vi.fn()
}))

vi.mock('@/services/formatter', () => ({
  formatter: {
    bytes: vi.fn()
  }
}))

describe('MemoryScaleFactorPreview', () => {
  beforeEach(() => {
    vi.mocked(formatter.bytes).mockImplementation((bytes) => `${bytes} B`)
    vi.mocked(useConfig).mockReturnValue({
      upscalers: [],
      upscalerOptions: [],
      safety_check_enabled: true,
      gpu_scale_factor: 0.8,
      ram_scale_factor: 0.8,
      total_gpu_memory: 8000000000,
      total_ram_memory: 16000000000,
      device_index: 0,
      isLoading: false,
      isHasDevice: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('displays memory usage preview with config data', () => {
    render(
      <MemoryScaleFactorPreview gpuScaleFactor={0.6} ramScaleFactor={0.6} />
    )

    expect(screen.getByText('Memory Usage Preview')).toBeInTheDocument()
    expect(formatter.bytes).toHaveBeenCalledWith(8000000000 * 0.6)
    expect(screen.getByText('GPU: 4800000000 B')).toBeInTheDocument()
    expect(formatter.bytes).toHaveBeenCalledWith(16000000000 * 0.6)
    expect(screen.getByText('RAM: 9600000000 B')).toBeInTheDocument()
  })

  it('displays zero when memory values are not available', () => {
    vi.mocked(useConfig).mockReturnValue({
      upscalers: [],
      upscalerOptions: [],
      safety_check_enabled: true,
      gpu_scale_factor: 0,
      ram_scale_factor: 0,
      total_gpu_memory: 0,
      total_ram_memory: 0,
      device_index: 0,
      isLoading: false,
      isHasDevice: true
    })

    render(
      <MemoryScaleFactorPreview gpuScaleFactor={0.6} ramScaleFactor={0.6} />
    )

    expect(screen.getByText('Memory Usage Preview')).toBeInTheDocument()
    expect(formatter.bytes).toHaveBeenCalledWith(0)
  })

  it('updates the preview when scale factor props change', () => {
    const { rerender } = render(
      <MemoryScaleFactorPreview gpuScaleFactor={0.6} ramScaleFactor={0.6} />
    )

    expect(formatter.bytes).toHaveBeenCalledWith(8000000000 * 0.6)
    expect(formatter.bytes).toHaveBeenCalledWith(16000000000 * 0.6)

    vi.mocked(formatter.bytes).mockClear()

    rerender(
      <MemoryScaleFactorPreview gpuScaleFactor={0.8} ramScaleFactor={0.7} />
    )

    expect(formatter.bytes).toHaveBeenCalledWith(8000000000 * 0.8)
    expect(formatter.bytes).toHaveBeenCalledWith(16000000000 * 0.7)
  })
})
