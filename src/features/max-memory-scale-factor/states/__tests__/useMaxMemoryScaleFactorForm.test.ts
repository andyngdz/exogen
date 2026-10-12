import { useMaxMemoryMutation } from '@/cores/api-queries'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMaxMemoryScaleFactorForm } from '../useMaxMemoryScaleFactorForm'

const push = vi.fn()
const mutate = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() })
}))
vi.mock('@/cores/api-queries', () => ({ useMaxMemoryMutation: vi.fn() }))

describe('useMaxMemoryScaleFactorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutate.mockReset()
    vi.mocked(useMaxMemoryMutation).mockReturnValue({
      mutate
    } as unknown as ReturnType<typeof useMaxMemoryMutation>)
  })

  it('saves the changed limits and moves on once saved', async () => {
    mutate.mockImplementation(
      (_values: unknown, options: { onSuccess: VoidFunction }) =>
        options.onSuccess()
    )
    const { result } = renderHook(() => useMaxMemoryScaleFactorForm())

    act(() => {
      result.current.onGpuChange(0.7)
    })
    await act(async () => {
      await result.current.onNext()
    })

    expect(mutate).toHaveBeenCalledWith(
      { gpuScaleFactor: 0.7, ramScaleFactor: 0.5 },
      expect.any(Object)
    )
    expect(push).toHaveBeenCalledWith('/model-recommendations')
  })

  it('stays on the step when saving fails', async () => {
    const { result } = renderHook(() => useMaxMemoryScaleFactorForm())

    await act(async () => {
      await result.current.onNext()
    })

    expect(mutate).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
