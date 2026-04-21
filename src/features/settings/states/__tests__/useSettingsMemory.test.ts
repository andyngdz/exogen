import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { useSettingsMemory } from '../useSettingsMemory'

const mockUseConfig = vi.fn()
const mockMutate = vi.fn()

vi.mock('@/cores/hooks', () => ({
  useConfig: () => mockUseConfig()
}))

vi.mock('@/cores/api-queries', () => ({
  useMaxMemoryMutation: () => ({
    mutate: mockMutate
  })
}))

describe('useSettingsMemory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseConfig.mockReturnValue({
      upscalers: [],
      upscalerOptions: [],
      safety_check_enabled: true,
      gpu_scale_factor: 0.6,
      ram_scale_factor: 0.7,
      total_gpu_memory: 0,
      total_ram_memory: 0,
      device_index: 0
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns config values', () => {
    const { result } = renderHook(() => useSettingsMemory())

    expect(result.current.gpu_scale_factor).toBe(0.6)
    expect(result.current.ram_scale_factor).toBe(0.7)
  })

  it('calls mutate with updated GPU value and current RAM', () => {
    const { result } = renderHook(() => useSettingsMemory())

    act(() => {
      result.current.onGpuChange(0.8)
    })

    expect(mockMutate).toHaveBeenCalledWith({
      gpuScaleFactor: 0.8,
      ramScaleFactor: 0.7
    })
  })

  it('calls mutate with updated RAM value and current GPU', () => {
    const { result } = renderHook(() => useSettingsMemory())

    act(() => {
      result.current.onRamChange(0.9)
    })

    expect(mockMutate).toHaveBeenCalledWith({
      gpuScaleFactor: 0.6,
      ramScaleFactor: 0.9
    })
  })
})
