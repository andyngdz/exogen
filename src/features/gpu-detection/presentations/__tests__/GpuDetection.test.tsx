import { useHardwareQuery, useMaxMemoryMutation } from '@/cores/api-queries'
import { MAX_MEMORY_FORM_DEFAULTS } from '@/features/max-memory-scale-factor/constants'
import { api } from '@/services'
import { BackendConfig, HardwareResponse } from '@/types'
import { toast } from '@heroui/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GpuDetection } from '../GpuDetection'

const mockPush = vi.fn()
const setMaxMemory = vi.fn()

vi.mock('@/cores/api-queries', () => ({
  useHardwareQuery: vi.fn(),
  useMaxMemoryMutation: vi.fn()
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() })
}))
vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  api: { selectDevice: vi.fn() }
}))
vi.mock('@/cores/shared/memory-scale-factor', () => ({
  MemoryScaleFactorItems: () => <div>Memory sliders</div>,
  MemoryScaleFactorPreview: () => <div>Memory preview</div>
}))
vi.mock('@heroui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@heroui/react')>()),
  toast: { danger: vi.fn() }
}))
vi.mock('@/cores/shared/onboarding/presentations/OnboardingLayout', () => ({
  OnboardingLayout: ({
    title,
    children,
    footer
  }: {
    title: string
    children: ReactNode
    footer: ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {children}
      {footer}
    </div>
  )
}))

const hardware = (overrides: Partial<HardwareResponse> = {}) =>
  ({
    is_cuda: true,
    cuda_runtime_version: '12.4',
    nvidia_driver_version: '560.94',
    message: '',
    gpus: [
      {
        name: 'NVIDIA GeForce RTX 3060',
        memory: 12 * 1024 ** 3,
        cuda_compute_capability: '8.6',
        is_primary: true
      }
    ],
    ...overrides
  }) as HardwareResponse

const renderStep = (data: HardwareResponse) => {
  vi.mocked(useHardwareQuery).mockReturnValue({
    data,
    refetch: vi.fn()
  } as unknown as ReturnType<typeof useHardwareQuery>)
  return render(<GpuDetection />)
}

describe('GpuDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMaxMemoryMutation).mockReturnValue({
      mutate: setMaxMemory
    } as unknown as ReturnType<typeof useMaxMemoryMutation>)
    setMaxMemory.mockImplementation(
      (_limits: unknown, options: { onSuccess: VoidFunction }) =>
        options.onSuccess()
    )
  })

  it('shows the GPU, its CUDA facts and the memory limits', () => {
    renderStep(hardware())

    expect(screen.getByText('NVIDIA GeForce RTX 3060')).toBeInTheDocument()
    expect(screen.getByText('CUDA ready')).toBeInTheDocument()
    expect(screen.getByText('560.94')).toBeInTheDocument()
    expect(screen.getByText('Memory sliders')).toBeInTheDocument()
  })

  it('saves the GPU, then the memory limits', async () => {
    const user = userEvent.setup()
    vi.mocked(api.selectDevice).mockResolvedValue({} as BackendConfig)
    renderStep(hardware())

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/model-recommendations')
    })
    expect(api.selectDevice).toHaveBeenCalledWith({ device_index: 0 })
    expect(setMaxMemory).toHaveBeenCalledWith(
      MAX_MEMORY_FORM_DEFAULTS,
      expect.anything()
    )
  })

  it('stays here and says why when the GPU is not saved', async () => {
    const user = userEvent.setup()
    vi.mocked(api.selectDevice).mockRejectedValue(new Error('Device busy'))
    renderStep(hardware())

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(toast.danger).toHaveBeenCalledWith('GPU not selected', {
        description: 'Device busy'
      })
    })
    expect(setMaxMemory).not.toHaveBeenCalled()
  })

  it('falls back to CPU mode without CUDA', () => {
    renderStep(hardware({ is_cuda: false, gpus: [] }))

    expect(screen.getByText('CPU Mode Only')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
})
