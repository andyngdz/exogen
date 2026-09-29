import { useSafetyCheckMutation } from '@/cores/api-queries'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneralSettings } from '../useGeneralSettings'
import { useSettingsStore } from '../useSettingsStore'

vi.mock('@/cores/api-queries', () => ({
  useSafetyCheckMutation: vi.fn()
}))

describe('useGeneralSettings', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useSettingsStore.setState({ values: { safety_check_enabled: true } })
    vi.mocked(useSafetyCheckMutation).mockReturnValue({
      mutate: mockMutate
    } as unknown as ReturnType<typeof useSafetyCheckMutation>)
  })

  it('reads the safety check value from the settings store', () => {
    const { result } = renderHook(() => useGeneralSettings())

    expect(result.current.isSafetyCheckEnabled).toBe(true)
  })

  it('does not sync the backend on mount', () => {
    renderHook(() => useGeneralSettings())

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('stores the new value and syncs the backend when toggled', () => {
    const { result } = renderHook(() => useGeneralSettings())

    act(() => {
      result.current.onSafetyCheckChange(false)
    })

    expect(useSettingsStore.getState().values.safety_check_enabled).toBe(false)
    expect(result.current.isSafetyCheckEnabled).toBe(false)
    expect(mockMutate).toHaveBeenCalledWith(false)
  })

  it('syncs each toggle to the backend', () => {
    const { result } = renderHook(() => useGeneralSettings())

    act(() => {
      result.current.onSafetyCheckChange(false)
    })
    act(() => {
      result.current.onSafetyCheckChange(true)
    })

    expect(mockMutate).toHaveBeenNthCalledWith(1, false)
    expect(mockMutate).toHaveBeenNthCalledWith(2, true)
    expect(useSettingsStore.getState().values.safety_check_enabled).toBe(true)
  })
})
